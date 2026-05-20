package q09_comment

import "time"

type Comment struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	CommenterName string    `json:"commenter_name" gorm:"size:80;not null"`
	Message       string    `json:"message" gorm:"type:text;not null"`
	CreatedAt     time.Time `json:"created_at"`
}

func (Comment) TableName() string { return "q09_comments" }

type CreateCommentInput struct {
	Message string `json:"message" binding:"required,min=1,max=1000"`
}
