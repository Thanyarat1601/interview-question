package q05_queue

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(api *gin.RouterGroup, db *gorm.DB) {
	h := NewHandler(db)
	g := api.Group("/q05")
	{
		g.GET("/queue/current", h.Current)
		g.POST("/queue/next", h.Next)
		g.POST("/queue/reset", h.Reset)
	}
}
