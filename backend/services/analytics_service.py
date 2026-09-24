from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.skill_repo import SkillRepository
from repositories.goal_repo import GoalRepository
from repositories.practice_repo import PracticeRepository
from repositories.post_repo import PostRepository
from models.goal import GoalStatus
from analytics.progress_service import ProgressService


class AnalyticsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.skill_repo = SkillRepository(session)
        self.goal_repo = GoalRepository(session)
        self.practice_repo = PracticeRepository(session)
        self.post_repo = PostRepository(session)

    async def get_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        skills = await self.skill_repo.get_user_skills(user_id)
        goals = await self.goal_repo.get_user_goals(user_id)
        practice_sessions = await self.practice_repo.get_user_practice_sessions(user_id, limit=500)

        # Aggregate practice stats & streak
        practice_aggregates = ProgressService.compute_practice_aggregates(practice_sessions)

        # Count goals and milestones
        completed_goals = sum(1 for g in goals if g.status == GoalStatus.COMPLETED)
        active_goals = sum(1 for g in goals if g.status == GoalStatus.ACTIVE)
        total_milestones_achieved = sum(
            sum(1 for m in g.milestones if m.achieved) for g in goals
        )

        # Format recent skills
        skill_cards = []
        for s in skills[:5]:
            total_mins = await self.skill_repo.get_skill_total_practice(s.id)
            skill_cards.append(s.to_dict(total_minutes=total_mins))

        # Recent activities (sorted descending)
        recent_practice = [s.to_dict() for s in practice_sessions[:5]]

        return {
            "stats": {
                "active_skills": len(skills),
                "total_practice_hours": practice_aggregates["total_hours"],
                "today_practice_hours": practice_aggregates["today_hours"],
                "this_week_hours": practice_aggregates["this_week_hours"],
                "this_month_hours": practice_aggregates["this_month_hours"],
                "completed_goals": completed_goals,
                "active_goals": active_goals,
                "milestones_achieved": total_milestones_achieved,
                "current_streak": practice_aggregates["current_streak"],
                "longest_streak": practice_aggregates["longest_streak"]
            },
            "recent_skills": skill_cards,
            "recent_practice": recent_practice,
            "recent_goals": [g.to_dict() for g in goals[:5]]
        }

    async def get_full_analytics(self, user_id: str) -> Dict[str, Any]:
        skills = await self.skill_repo.get_user_skills(user_id)
        goals = await self.goal_repo.get_user_goals(user_id)
        practice_sessions = await self.practice_repo.get_user_practice_sessions(user_id, limit=500)

        practice_aggregates = ProgressService.compute_practice_aggregates(practice_sessions)
        chart_data = ProgressService.generate_chart_data(practice_sessions, skills, goals)

        # Determine most practiced skill
        most_practiced = "None"
        if chart_data["hours_by_skill"]:
            sorted_skills = sorted(chart_data["hours_by_skill"], key=lambda x: x["hours"], reverse=True)
            if sorted_skills and sorted_skills[0]["hours"] > 0:
                most_practiced = sorted_skills[0]["skill"]

        completed_goals = sum(1 for g in goals if g.status == GoalStatus.COMPLETED)
        active_goals = sum(1 for g in goals if g.status == GoalStatus.ACTIVE)
        milestones_achieved = sum(
            sum(1 for m in g.milestones if m.achieved) for g in goals
        )

        return {
            "summary": {
                "total_practice_hours": practice_aggregates["total_hours"],
                "weekly_practice_hours": practice_aggregates["this_week_hours"],
                "monthly_practice_hours": practice_aggregates["this_month_hours"],
                "most_practiced_skill": most_practiced,
                "current_streak": practice_aggregates["current_streak"],
                "longest_streak": practice_aggregates["longest_streak"],
                "goals_completed": completed_goals,
                "active_goals": active_goals,
                "milestones_achieved": milestones_achieved
            },
            "charts": chart_data
        }
