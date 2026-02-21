"""Lead management — load, queue, track, and save call results."""

import csv
import io
import uuid
import logging
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field, asdict

logger = logging.getLogger(__name__)


@dataclass
class Lead:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    phone: str = ""
    email: str = ""
    area: str = ""
    notes: str = ""
    status: str = "pending"  # pending, queued, in-progress, completed, no-answer, failed
    qualification_score: Optional[int] = None
    call_summary: Optional[str] = None
    booking_status: Optional[str] = None  # None, booked, declined, callback
    callback_time: Optional[str] = None
    call_id: Optional[str] = None
    imported_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    called_at: Optional[str] = None
    completed_at: Optional[str] = None


class LeadManager:
    """In-memory lead manager. Swap with Supabase for production."""

    def __init__(self):
        self.leads: dict[str, Lead] = {}
        self.call_queue: list[str] = []  # lead IDs in order

    def import_csv(self, csv_content: str) -> list[Lead]:
        """Parse CSV and import leads. Expected: name, phone, email, area, notes."""
        reader = csv.DictReader(io.StringIO(csv_content))
        imported = []
        for row in reader:
            lead = Lead(
                name=row.get("name", "").strip(),
                phone=row.get("phone", "").strip(),
                email=row.get("email", "").strip(),
                area=row.get("area", "").strip(),
                notes=row.get("notes", "").strip(),
            )
            if not lead.phone:
                continue
            self.leads[lead.id] = lead
            imported.append(lead)
        logger.info(f"Imported {len(imported)} leads from CSV")
        return imported

    def queue_lead(self, lead_id: str) -> bool:
        """Add a lead to the call queue."""
        if lead_id not in self.leads:
            return False
        lead = self.leads[lead_id]
        if lead.status not in ("pending", "no-answer", "failed"):
            return False
        lead.status = "queued"
        self.call_queue.append(lead_id)
        return True

    def queue_all_pending(self) -> int:
        """Queue all pending leads."""
        count = 0
        for lead_id, lead in self.leads.items():
            if lead.status == "pending":
                self.queue_lead(lead_id)
                count += 1
        return count

    def next_lead(self) -> Optional[Lead]:
        """Pop the next lead from the queue."""
        while self.call_queue:
            lead_id = self.call_queue.pop(0)
            if lead_id in self.leads and self.leads[lead_id].status == "queued":
                lead = self.leads[lead_id]
                lead.status = "in-progress"
                lead.called_at = datetime.utcnow().isoformat()
                return lead
        return None

    def complete_call(
        self,
        lead_id: str,
        score: Optional[int] = None,
        summary: Optional[str] = None,
        booking: Optional[str] = None,
        callback_time: Optional[str] = None,
        call_id: Optional[str] = None,
    ):
        """Record call results for a lead."""
        if lead_id not in self.leads:
            return
        lead = self.leads[lead_id]
        lead.status = "completed"
        lead.completed_at = datetime.utcnow().isoformat()
        lead.qualification_score = score
        lead.call_summary = summary
        lead.booking_status = booking
        lead.callback_time = callback_time
        if call_id:
            lead.call_id = call_id
        logger.info(f"Lead {lead_id} completed — score={score}, booking={booking}")

    def mark_no_answer(self, lead_id: str):
        if lead_id in self.leads:
            self.leads[lead_id].status = "no-answer"

    def mark_failed(self, lead_id: str):
        if lead_id in self.leads:
            self.leads[lead_id].status = "failed"

    def get_lead(self, lead_id: str) -> Optional[Lead]:
        return self.leads.get(lead_id)

    def list_leads(self, status: Optional[str] = None, limit: int = 100, offset: int = 0) -> list[dict]:
        leads = list(self.leads.values())
        if status:
            leads = [l for l in leads if l.status == status]
        leads.sort(key=lambda l: l.imported_at, reverse=True)
        return [asdict(l) for l in leads[offset:offset + limit]]

    def stats(self) -> dict:
        statuses = {}
        for lead in self.leads.values():
            statuses[lead.status] = statuses.get(lead.status, 0) + 1
        return {"total": len(self.leads), "queued": len(self.call_queue), "by_status": statuses}


# Singleton
lead_manager = LeadManager()
