package q05_queue

import "time"

// Queue state: A0 -> A9 -> B0 -> ... -> Z9 (260 tickets total).
// Singleton row with ID=1; LetterIdx 0..25, DigitIdx 0..9, Current = current ticket or "00".
type QueueState struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	LetterIdx int       `json:"letter_idx"`
	DigitIdx  int       `json:"digit_idx"`
	Current   string    `json:"current" gorm:"size:8;not null;default:'00'"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (QueueState) TableName() string { return "q05_queue_state" }
