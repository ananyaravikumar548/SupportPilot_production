from django.urls import path
from .views import (
    TicketViewSet, 
    MasterDataView, 
    PreviewClassifyView, 
    KBArticleView,
    start_agent_workflow,
    get_workflow_status,
    sync_jira_webhook,
    get_customer_email_logs,
    get_agent_tickets,
    get_unassigned_tickets,
    get_available_agents,
    assign_ticket,
    get_jira_tickets_log,
    reopen_ticket,
)

urlpatterns = [
    # Support both /api/tickets and /api/tickets/
    path('tickets', TicketViewSet.as_view(), name='tickets-no-slash'),
    path('tickets/', TicketViewSet.as_view(), name='tickets'),
    path('tickets/<str:ticket_id>/', TicketViewSet.as_view(), name='ticket-detail'),
    path('tickets/<str:ticket_id>', TicketViewSet.as_view(), name='ticket-detail-no-slash'),
    path('tickets/<str:ticket_id>/reopen/', reopen_ticket, name='ticket-reopen'),

    path('master-data', MasterDataView.as_view(), name='master-data-no-slash'),
    path('master-data/', MasterDataView.as_view(), name='master-data'),

    path('preview-classify', PreviewClassifyView.as_view(), name='preview-classify-no-slash'),
    path('preview-classify/', PreviewClassifyView.as_view(), name='preview-classify'),

    path('articles', KBArticleView.as_view(), name='kb-articles-no-slash'),
    path('articles/', KBArticleView.as_view(), name='kb-articles'),
    path('email/logs/me/', get_customer_email_logs, name='customer-email-logs'),
    path('agent/tickets/', get_agent_tickets, name='agent-tickets'),

    # --- Agent Manager Routes ---
    path('manager/unassigned-tickets/', get_unassigned_tickets, name='manager-unassigned-tickets'),
    path('manager/agents/', get_available_agents, name='manager-agents'),
    path('manager/assign-ticket/', assign_ticket, name='manager-assign-ticket'),
    path('manager/jira-tickets/', get_jira_tickets_log, name='manager-jira-tickets'),

    # --- Milestone 3 Agent & Integration Routes ---
    path('agent/workflow/start', start_agent_workflow, name='start_agent_workflow'),
    path('agent/workflow/<str:ticket_id>', get_workflow_status, name='get_workflow_status'),
    path('jira/sync', sync_jira_webhook, name='sync_jira_webhook'),
]
