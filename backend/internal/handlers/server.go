package handlers

import (
	"context"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/EmilioCliff/jonche/internal/postgres"
	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
	ln     net.Listener
	srv    *http.Server

	config     pkg.Config
	tokenMaker pkg.JWTMaker
	repo       *postgres.PostgresRepo

	taskDistributor services.WorkerService
}

func NewServer(
	config pkg.Config,
	tokenMaker pkg.JWTMaker,
	repo *postgres.PostgresRepo,
	worker services.WorkerService,
) *Server {
	if config.ENVIRONMENT == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	s := &Server{
		router: r,
		ln:     nil,

		config:     config,
		tokenMaker: tokenMaker,
		repo:       repo,

		taskDistributor: worker,
	}

	s.setUpRoutes()

	return s
}

func (s *Server) setUpRoutes() {
	s.router.Use(CORSmiddleware())
	v1 := s.router.Group("/api/v1")

	// health check
	s.router.GET("/health-check", s.healthCheckHandler)

	// user routes
	v1.POST("/user", s.createUser)
	v1.POST("/user/login", s.login)
	v1.GET("/user/logout", s.logout)
	v1.GET("/user/refresh-token", s.refreshToken)
	v1.GET("/users", s.listUsers)
	v1.GET("/user/:id", s.getUser)
	v1.PATCH("/user/:id", s.updateUserDetails)
	v1.DELETE("/user/:id", s.deleteUser)

	// customer routes
	v1.POST("/customer", s.createCustomer)
	v1.GET("/customers", s.listCustomers)
	v1.GET("/customer/half/:id", s.getCustomer)
	v1.GET("/customer/:id", s.getCustomerFullData)
	v1.GET("/customer/loans/:id", s.getCustomerLoans)
	v1.GET("/customer/payments/:id", s.getCustomerPaymens)
	v1.GET("/customer/sms/:id", s.getCustomerSms)
	v1.PATCH("/customer/:id", s.updateCustomerDetails)
	v1.DELETE("/customer/:id", s.deleteCustomers)

	// payments routes
	v1.POST("/payment/callback", s.paymentCallback)
	v1.POST("/payment", s.createPayment)
	v1.GET("/payments", s.listPayments)
	v1.GET("/payment/:id", s.getPayment)
	v1.PATCH("/payment/:id", s.assignPayment)

	// loan routes
	v1.POST("/loan", s.createLoan)
	v1.GET("/loans", s.listLoans)
	v1.GET("/loan/:id", s.getLoan)
	v1.DELETE("/loan/:id", s.deleteLoan)

	// sms routes
	v1.POST("/sms/callback", s.smsCallback)
	v1.POST("/sms", s.createSMS)
	v1.GET("/sms", s.listSMS)
	v1.GET("/sms/:id", s.getSMS)
	v1.PATCH("/sms/:id", s.deliverSMS)

	// helper routes
	v1.GET("/helper/customer", s.getCustomerList)
	v1.GET("/dashboard/stats", s.getDashboardStats)
	v1.GET("/dashboard/overview", s.getDashboardOverview)

	s.srv = &http.Server{
		Addr:         s.config.HTTP_PORT,
		Handler:      s.router.Handler(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
}

func (s *Server) healthCheckHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (s *Server) Start() error {
	var err error
	if s.ln, err = net.Listen("tcp", s.config.HTTP_PORT); err != nil {
		return err
	}

	go func(s *Server) {
		err := s.srv.Serve(s.ln)
		if err != nil && err != http.ErrServerClosed {
			panic(err)
		}
	}(s)

	return nil
}

func (s *Server) Stop() error {
	log.Println("Shutting down http server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return s.srv.Shutdown(ctx)
}

func (s *Server) GetPort() int {
	if s.ln == nil {
		return 0
	}

	return s.ln.Addr().(*net.TCPAddr).Port
}

func errorResponse(err error) gin.H {
	return gin.H{
		"status_code": pkg.ErrorCode(err),
		"message":     pkg.ErrorMessage(err),
	}
}
