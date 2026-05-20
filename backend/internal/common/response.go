package common

import "github.com/gin-gonic/gin"

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func OK(c *gin.Context, status int, data interface{}, msg string) {
	if msg == "" {
		msg = "success"
	}
	c.JSON(status, Response{Success: true, Message: msg, Data: data})
}

func Fail(c *gin.Context, status int, msg string) {
	c.JSON(status, Response{Success: false, Message: msg})
}
