package q08_exam_admin

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	h := NewHandler(db)
	g := api.Group("/q08")
	{
		g.GET("/exams", h.List)
		g.POST("/exams", h.Create)
		g.DELETE("/exams/:id", h.Delete)
	}
}

func Seed(db *gorm.DB) error {
	var count int64
	if err := db.Model(&Exam{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	rows := []Exam{
		{QuestionText: "ภาษาใดต่อไปนี้เป็น compiled language?", ChoiceA: "Python", ChoiceB: "JavaScript", ChoiceC: "Go", ChoiceD: "Ruby", CorrectAnswer: "C"},
		{QuestionText: "HTTP status code 401 หมายถึง?", ChoiceA: "Not Found", ChoiceB: "Unauthorized", ChoiceC: "Forbidden", ChoiceD: "Bad Request", CorrectAnswer: "B"},
		{QuestionText: "Angular ใช้ภาษาใดเป็นหลัก?", ChoiceA: "JavaScript", ChoiceB: "Java", ChoiceC: "Dart", ChoiceD: "TypeScript", CorrectAnswer: "D"},
	}
	return db.Create(&rows).Error
}
