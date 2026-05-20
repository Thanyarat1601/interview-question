package middleware

import (
	"net/http"
	"strings"
	"time"

	"example.com/interview-question-tcc-thaibev/backend/internal/common"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func IssueToken(secret string, userID uint, username string, ttl time.Duration) (string, time.Time, error) {
	expiresAt := time.Now().Add(ttl)
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "interview-question-tcc-thaibev",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	return signed, expiresAt, err
}

func ParseToken(secret, tokenString string) (*Claims, error) {
	claims := &Claims{}
	_, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	return claims, nil
}

func RequireJWT(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			common.Fail(c, http.StatusUnauthorized, "missing or invalid Authorization header")
			c.Abort()
			return
		}
		tokenStr := strings.TrimPrefix(header, "Bearer ")
		claims, err := ParseToken(secret, tokenStr)
		if err != nil {
			common.Fail(c, http.StatusUnauthorized, "invalid or expired token")
			c.Abort()
			return
		}
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}
