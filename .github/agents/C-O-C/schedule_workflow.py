from mistralai.client import Mistral, models

client = Mistral()

response = await client.workflows.schedules.schedule_workflow(
    workflow_identifier="autonomous-system-orchestrator",
    deployment_name="production",
    schedule=models.ScheduleDefinition(
        input={
            "task_intent": "Run autonomous system reconciliation and architecture verification",
            "target_environment": "ubuntu-workstation"
        },
        calendars=[
            models.ScheduleCalendar(
                day_of_week=[models.ScheduleRange(start=1)],  # Monday (1 = Monday)
                hour=[models.ScheduleRange(start=9)],          # 9 AM
                minute=[models.ScheduleRange(start=0)],        # :00
                comment="Every Monday at 9am"
            )
        ]
    )
)

print(f"Schedule Created Successfully. Schedule ID: {response.schedule_id}")
