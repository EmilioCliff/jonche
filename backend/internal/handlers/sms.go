package handlers

import (
	"net/http"

	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (s *Server) smsCallback(ctx *gin.Context) {
	var rq any
	if err := ctx.ShouldBindJSON(&rq); err != nil {
		ctx.JSON(http.StatusOK, gin.H{
			"ResultCode": 400,
			"ResultDesc": "Rejected",
		})

		return
	}

	req, _ := rq.(map[string]interface{})

	st := req["status"].(string)

	params := &repository.UpdateSMS{
		RefID:          uuid.MustParse(req["refId"].(string)),
		CallbackStatus: &st,
	}
	if st == "DeliveredToTerminal" || st == "DELIVRD" {
		delivered := "delivered"
		params.DeliveryStatus = &delivered
	}

	if err := s.repo.SMSRepo.UpdateSMS(ctx, params); err != nil {
		ctx.JSON(http.StatusOK, gin.H{
			"ResultCode": 500,
			"ResultDesc": "Rejected",
		})

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"ResultCode": 200,
		"ResultDesc": "Accepted",
	})
}

type createSMSReq struct {
	CustomerIDs []uint32 `json:"customer_ids" binding:"required"`
	Message     string   `json:"message"      binding:"required"`
}

func (s *Server) createSMS(ctx *gin.Context) {
	var req createSMSReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	if err := s.repo.SMSRepo.CreateSMS(ctx, &repository.SMS{Message: req.Message}, req.CustomerIDs, s.taskDistributor.DistributeTaskSendSMS); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "SMS schedule for sending successfully"})
}

func (s *Server) listSMS(ctx *gin.Context) {
	pageNoStr := ctx.DefaultQuery("page", "1")
	pageNo, err := pkg.StringToUint32(pageNoStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	pageSizeStr := ctx.DefaultQuery("limit", "10")
	pageSize, err := pkg.StringToUint32(pageSizeStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	sms, metadata, err := s.repo.SMSRepo.ListSMS(
		ctx,
		&pkg.PaginationMetadata{CurrentPage: pageNo, PageSize: pageSize},
	)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": sms, "metadata": metadata})
}

func (s *Server) getSMS(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	sms, err := s.repo.SMSRepo.GetSMS(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": sms})
}

func (s *Server) deliverSMS(ctx *gin.Context) {
	id, err := pkg.StringToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	if err := s.repo.SMSRepo.DeliverSMS(ctx, id); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "success"})
}
