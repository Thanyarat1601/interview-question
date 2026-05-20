package q10_exam

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	h := NewHandler(db)
	g := api.Group("/q10")
	{
		g.GET("/questions", h.Questions)
		g.POST("/submissions", h.Submit)
		g.GET("/submissions/:id", h.Get)
	}
}

func Seed(db *gorm.DB) error {
	var count int64
	if err := db.Model(&Question{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	rows := []Question{
		{QuestionText: "Go ใช้คำสำคัญใดในการประกาศตัวแปร?", ChoiceA: "let", ChoiceB: "var", ChoiceC: "dim", ChoiceD: "set", CorrectAnswer: "B"},
		{QuestionText: "ใน PostgreSQL คำสั่งใดใช้สร้าง row-level lock?", ChoiceA: "LOCK ROW", ChoiceB: "SELECT FOR UPDATE", ChoiceC: "BEGIN EXCLUSIVE", ChoiceD: "PRAGMA LOCK", CorrectAnswer: "B"},
		{QuestionText: "อัลกอริทึมใดใช้ hash password อย่างปลอดภัย?", ChoiceA: "MD5", ChoiceB: "SHA1", ChoiceC: "bcrypt", ChoiceD: "Base64", CorrectAnswer: "C"},
		{QuestionText: "Angular signal ใช้ทำอะไร?", ChoiceA: "ส่ง HTTP request", ChoiceB: "Reactive state", ChoiceC: "เก็บ token", ChoiceD: "Routing", CorrectAnswer: "B"},
		{QuestionText: "REST API method ใดควรใช้ลบข้อมูล?", ChoiceA: "GET", ChoiceB: "POST", ChoiceC: "PATCH", ChoiceD: "DELETE", CorrectAnswer: "D"},
	}
	return db.Create(&rows).Error
}
