from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any, Tuple
from collections import defaultdict


class ProgressService:
    @staticmethod
    def calculate_streaks(session_dates: List[datetime]) -> Tuple[int, int]:
        """
        Calculates current streak and longest streak based on practice session dates.
        A streak is consecutive calendar days where at least 1 session occurred.
        Multiple sessions on the same day are deduplicated.
        """
        if not session_dates:
            return 0, 0

        # Extract unique dates sorted in ascending order
        unique_dates = sorted(list(set(d.date() if isinstance(d, datetime) else d for d in session_dates)))
        if not unique_dates:
            return 0, 0

        longest_streak = 0
        current_streak = 0

        # Calculate longest streak across all history
        temp_streak = 1
        for i in range(1, len(unique_dates)):
            if (unique_dates[i] - unique_dates[i - 1]).days == 1:
                temp_streak += 1
            else:
                if temp_streak > longest_streak:
                    longest_streak = temp_streak
                temp_streak = 1
        if temp_streak > longest_streak:
            longest_streak = temp_streak

        # Calculate current streak ending today or yesterday
        today = datetime.now(timezone.utc).date()
        latest_date = unique_dates[-1]

        # Streak is alive if user practiced today or yesterday
        days_since_latest = (today - latest_date).days
        if days_since_latest <= 1:
            streak = 1
            for i in range(len(unique_dates) - 1, 0, -1):
                if (unique_dates[i] - unique_dates[i - 1]).days == 1:
                    streak += 1
                else:
                    break
            current_streak = streak
        else:
            current_streak = 0

        return current_streak, max(longest_streak, current_streak)

    @staticmethod
    def calculate_goal_progress(current_val: float, target_val: float) -> float:
        if target_val <= 0:
            return 0.0
        pct = (current_val / target_val) * 100
        return min(round(pct, 1), 100.0)

    @staticmethod
    def compute_practice_aggregates(sessions: List[Any]) -> Dict[str, Any]:
        """
        Computes today, this week, this month practice times and streak.
        """
        now = datetime.now(timezone.utc)
        today = now.date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = date(today.year, today.month, 1)

        total_minutes = 0
        today_minutes = 0
        week_minutes = 0
        month_minutes = 0

        session_dates = []

        for s in sessions:
            p_date = s.practiced_at
            if isinstance(p_date, str):
                p_date = datetime.fromisoformat(p_date.replace("Z", "+00:00"))
            session_dates.append(p_date)
            dur = s.duration_minutes or 0
            total_minutes += dur

            s_date = p_date.date()
            if s_date == today:
                today_minutes += dur
            if s_date >= start_of_week:
                week_minutes += dur
            if s_date >= start_of_month:
                month_minutes += dur

        current_streak, longest_streak = ProgressService.calculate_streaks(session_dates)

        return {
            "total_minutes": total_minutes,
            "total_hours": round(total_minutes / 60, 1),
            "today_minutes": today_minutes,
            "today_hours": round(today_minutes / 60, 1),
            "this_week_minutes": week_minutes,
            "this_week_hours": round(week_minutes / 60, 1),
            "this_month_minutes": month_minutes,
            "this_month_hours": round(month_minutes / 60, 1),
            "current_streak": current_streak,
            "longest_streak": longest_streak
        }

    @staticmethod
    def generate_chart_data(sessions: List[Any], skills: List[Any], goals: List[Any]) -> Dict[str, Any]:
        # 1. Practice Hours by Skill
        skill_name_map = {s.id: s.skill_name for s in skills}
        skill_mins = defaultdict(int)
        for s in sessions:
            name = skill_name_map.get(s.skill_id, "Other")
            skill_mins[name] += s.duration_minutes or 0

        hours_by_skill = [
            {"skill": name, "hours": round(mins / 60, 1)}
            for name, mins in skill_mins.items()
        ]

        # 2. Weekly Practice Trend (Last 7 Days)
        today = datetime.now(timezone.utc).date()
        daily_trend = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_str = day.strftime("%a")  # Mon, Tue, etc.
            mins = sum(
                s.duration_minutes for s in sessions
                if (s.practiced_at.date() if isinstance(s.practiced_at, datetime) else s.practiced_at) == day
            )
            daily_trend.append({"day": day_str, "date": day.isoformat(), "hours": round(mins / 60, 1)})

        # 3. Monthly Practice Progress (Past 4 Weeks)
        monthly_trend = []
        for w in range(3, -1, -1):
            week_start = today - timedelta(days=(w * 7) + 6)
            week_end = today - timedelta(days=w * 7)
            mins = sum(
                s.duration_minutes for s in sessions
                if week_start <= (s.practiced_at.date() if isinstance(s.practiced_at, datetime) else s.practiced_at) <= week_end
            )
            monthly_trend.append({"week": f"Week {4-w}", "hours": round(mins / 60, 1)})

        # 4. Goal Completion
        goal_stats = [
            {
                "title": g.title,
                "current": g.current_value,
                "target": g.target_value,
                "progress": g.progress_percent,
                "status": g.status.value if hasattr(g.status, "value") else str(g.status)
            }
            for g in goals
        ]

        # 5. Skill Category Distribution
        cat_counts = defaultdict(int)
        for s in skills:
            cat = s.category or "General"
            cat_counts[cat] += 1
        category_distribution = [{"name": k, "value": v} for k, v in cat_counts.items()]

        return {
            "hours_by_skill": hours_by_skill,
            "weekly_trend": daily_trend,
            "monthly_trend": monthly_trend,
            "goal_stats": goal_stats,
            "skill_distribution": category_distribution
        }
