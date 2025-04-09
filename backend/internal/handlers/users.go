package handlers

import (
	"net/http"
	"time"

	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/gin-gonic/gin"
)

type createUserReq struct {
	Name     string `json:"name"     binding:"required"`
	Email    string `json:"email"    binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (s *Server) createUser(ctx *gin.Context) {
	var req createUserReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	hashPassword, err := pkg.GenerateHashPassword(req.Password, s.config.PASSWORD_COST)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	user, err := s.repo.UserRepo.CreateUser(ctx, &repository.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashPassword,
	})
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	user.Password = ""

	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

type loginReq struct {
	Email    string `binding:"required" json:"email"`
	Password string `binding:"required" json:"password"`
}

func (s *Server) login(ctx *gin.Context) {
	var req loginReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	user, err := s.repo.UserRepo.GetUser(ctx, nil, &req.Email)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	if err := pkg.ComparePasswordAndHash(user.Password, req.Password); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	refreshToken, err := s.tokenMaker.CreateToken(
		user.ID,
		user.Name,
		user.Email,
		s.config.REFRESH_TOKEN_DURATION,
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	accessToken, err := s.tokenMaker.CreateToken(
		user.ID,
		user.Name,
		user.Email,
		s.config.TOKEN_DURATION,
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.SetCookie(
		"refreshToken",
		refreshToken,
		int(s.config.REFRESH_TOKEN_DURATION),
		"/",
		"",
		true,
		true,
	)

	_, err = s.repo.UserRepo.UpdateUserDetails(ctx, &repository.UpdateUser{
		ID:           user.ID,
		RefreshToken: &refreshToken,
	})
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"access_token":            accessToken,
			"access_token_expires_at": time.Now().Add(s.config.TOKEN_DURATION),
		}})
}

func (s *Server) logout(ctx *gin.Context) {
	ctx.SetCookie("refreshToken", "", -1, "/", "", true, true)
	ctx.JSON(http.StatusOK, gin.H{"data": "success"})
}

func (s *Server) refreshToken(ctx *gin.Context) {
	refreshToken, err := ctx.Cookie("refreshToken")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Refresh token not found"})
		return
	}

	payload, err := s.tokenMaker.GetPayload(refreshToken)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	if payload.RegisteredClaims.ExpiresAt.Time.Before(time.Now()) {
		ctx.JSON(
			http.StatusNotExtended,
			errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "refresh token is expired")),
		)

		return
	}

	accesstoken, err := s.tokenMaker.CreateToken(
		payload.UserID,
		payload.Name,
		payload.Email,
		s.config.TOKEN_DURATION,
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": gin.H{
		"access_token":            accesstoken,
		"access_token_expires_at": time.Now().Add(s.config.TOKEN_DURATION),
	}})
}

func (s *Server) listUsers(ctx *gin.Context) {
	users, err := s.repo.UserRepo.ListUsers(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": users})
}

func (s *Server) getUser(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	user, err := s.repo.UserRepo.GetUser(ctx, &id, nil)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

type updateUserDetailsReq struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

func (s *Server) updateUserDetails(ctx *gin.Context) {
	var req updateUserDetailsReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	params := &repository.UpdateUser{
		ID: id,
	}

	if req.Name != "" {
		params.Name = &req.Name
	}

	if req.Password != "" {
		hashPassword, err := pkg.GenerateHashPassword(req.Password, s.config.PASSWORD_COST)
		if err != nil {
			ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

			return
		}
		params.Password = &hashPassword
	}

	user, err := s.repo.UserRepo.UpdateUserDetails(ctx, params)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

func (s *Server) deleteUser(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	if err := s.repo.UserRepo.DeleteUser(ctx, id); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "success"})
}
