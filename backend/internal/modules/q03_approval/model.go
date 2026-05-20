package q03_approval

import "time"

type ApprovalStatus string

const (
	StatusPending  ApprovalStatus = "pending"
	StatusApproved ApprovalStatus = "approved"
	StatusRejected ApprovalStatus = "rejected"
)

type Document struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"size:200;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Status      ApprovalStatus `json:"status" gorm:"size:20;not null;default:pending"`
	Reason      string         `json:"reason" gorm:"type:text"`
	DecidedAt   *time.Time     `json:"decided_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

func (Document) TableName() string { return "q03_approval_documents" }

type DecisionInput struct {
	Reason string `json:"reason" binding:"required,min=2,max=500"`
}
