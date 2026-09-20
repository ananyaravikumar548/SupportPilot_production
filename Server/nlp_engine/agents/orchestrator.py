import uuid
import datetime
from tickets.models import AgentWorkflow, AgentExecution
from .diagnosis_agent import DiagnosisAgent
from .retrieval_agent import KnowledgeRetrievalAgent
from .resolution_agent import ResolutionAgent
from .escalation_agent import EscalationAgent


class MultiAgentOrchestrator:
    def __init__(self):
        self.diagnosis_agent = DiagnosisAgent()
        self.retrieval_agent = KnowledgeRetrievalAgent()  # <-- Update instance creation here
        self.resolution_agent = ResolutionAgent()
        self.escalation_agent = EscalationAgent()

    def run_workflow(self, ticket_id, title, description, category):
        workflow = AgentWorkflow(
            ticket_id=str(ticket_id),
            workflow_status="RUNNING",
            current_agent="Diagnosis"
        )
        workflow.save()

        # 1. Diagnosis Agent
        diag_res = self.diagnosis_agent.execute(ticket_id, title, description, category)
        self._log_execution(
            workflow.workflow_id, 
            "Diagnosis", 
            {"ticket_id": ticket_id, "title": title, "category": category}, 
            diag_res, 
            diag_res["confidence"]
        )

        # 2. Knowledge Retrieval Agent
        workflow.current_agent = "Retrieval"
        workflow.save()
        ret_res = self.retrieval_agent.execute(diag_res)
        self._log_execution(workflow.workflow_id, "Retrieval", diag_res, ret_res, 0.90)

        # 3. Resolution Agent
        workflow.current_agent = "Resolution"
        workflow.save()
        res_res = self.resolution_agent.execute(diag_res, ret_res)
        self._log_execution(workflow.workflow_id, "Resolution", ret_res, res_res, res_res["confidence"])

        # 4. Confidence Evaluation & Decisioning
        final_confidence = min(diag_res["confidence"], res_res["confidence"])
        
        if final_confidence >= 0.80:
            workflow.workflow_status = "COMPLETED"
            workflow.final_confidence = final_confidence
            workflow.completed_at = datetime.datetime.utcnow()
            workflow.save()
            return {
                "status": "COMPLETED",
                "workflow_id": workflow.workflow_id,
                "diagnosis": diag_res["diagnosis"],
                "suggested_steps": res_res.get("suggested_steps", []),
                "sources": res_res.get("sources", []),
                "confidence": final_confidence
            }
        else:
            workflow.current_agent = "Escalation"
            esc_res = self.escalation_agent.execute(ticket_id, "Low AI resolution confidence")
            self._log_execution(workflow.workflow_id, "Escalation", res_res, esc_res, 1.0)
            
            workflow.workflow_status = "ESCALATED"
            workflow.final_confidence = final_confidence
            workflow.completed_at = datetime.datetime.utcnow()
            workflow.save()
            return {
                "status": "ESCALATED",
                "workflow_id": workflow.workflow_id,
                "reason": esc_res.get("reason", "Low AI resolution confidence"),
                "assigned_team": esc_res.get("assigned_team", "IT Helpdesk")
            }

    def _log_execution(self, workflow_id, agent_name, input_data, output_data, confidence):
        execution = AgentExecution(
            workflow_id=workflow_id,
            agent_name=agent_name,
            input_data=input_data,
            output_data=output_data,
            confidence=confidence,
            status="SUCCESS"
        )
        execution.save()