package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/EmilioCliff/jonche/internal/handlers"
	"github.com/EmilioCliff/jonche/internal/postgres"
	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/internal/workers"
	"github.com/EmilioCliff/jonche/pkg"
)

func main() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	configPath := "/home/emilio-cliff/jonche/backend/.envs/.local"
	config, err := pkg.LoanConfig(configPath, "config", "yaml")
	if err != nil {
		panic(err)
	}

	store := postgres.NewStore(config)
	err = store.OpenDB(context.Background())
	if err != nil {
		panic(err)
	}

	maker, err := pkg.NewJWTMaker(config.RSA_PRIVATE_KEY, config.RSA_PUBLIC_KEY, config)
	if err != nil {
		panic(err)
	}

	repo := postgres.NewPostgresRepo(store)

	redisConfig := services.RedisConfig{
		Address:  config.REDIS_ADDRESS,
		Password: config.REDIS_PASSWORD,
		DB:       0,
	}

	worker := workers.NewWorkerService(redisConfig, repo, config)
	err = worker.StartProcessor()
	if err != nil {
		panic(err)
	}

	srv := handlers.NewServer(config, *maker, repo, worker)
	log.Println("starting server at port: ", config.HTTP_PORT)
	if err := srv.Start(); err != nil {
		panic(err)
	}

	token, _ := maker.CreateToken(1, "CLIFF", "emiliocliff@gmail.com", 10*time.Hour)
	log.Println(token)

	<-quit

	store.CloseDB()

	if err = srv.Stop(); err != nil {
		log.Fatal(err)
	}

	worker.StopProcessor()

	log.Println("Server shutdown ...")
}
