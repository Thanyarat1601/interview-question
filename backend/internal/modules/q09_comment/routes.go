package q09_comment

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	h := NewHandler(db)
	g := api.Group("/q09")
	{
		g.GET("/comments", h.List)
		g.POST("/comments", h.Create)
	}
}
