package pkg

import (
	"log"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	DATABASE_URL            string        `mapstructure:"DATABASE_URL"`
	MIGRATION_PATH          string        `mapstructure:"MIGRATION_PATH"`
	ENVIRONMENT             string        `mapstructure:"ENVIRONMENT"`
	HTTP_PORT               string        `mapstructure:"HTTP_PORT"`
	PASSWORD_COST           int           `mapstructure:"PASSWORD_COST"`
	PASSWORD_RESET_DURATION time.Duration `mapstructure:"PASSWORD_RESET_DURATION"`
	REFRESH_TOKEN_DURATION  time.Duration `mapstructure:"REFRESH_TOKEN_DURATION"`
	TOKEN_DURATION          time.Duration `mapstructure:"TOKEN_DURATION"`
	RSA_PRIVATE_KEY         string        `mapstructure:"RSA_PRIVATE_KEY"`
	RSA_PUBLIC_KEY          string        `mapstructure:"RSA_PUBLIC_KEY"`
	REDIS_ADDRESS           string        `mapstructure:"REDIS_ADDRESS"`
	REDIS_PASSWORD          string        `mapstructure:"REDIS_PASSWORD"`
	TIARA_API_KEY           string        `mapstructure:"TIARA_API_KEY"`
	TIARA_ENDPOINT          string        `mapstructure:"TIARA_ENDPOINT"`
}

func LoanConfig(path, name, configType string) (Config, error) {
	viper.AddConfigPath(path)
	viper.SetConfigName(name)
	viper.SetConfigType(configType)
	setDefaults()

	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Println("Config file not found, using environment variables")
		} else {
			return Config{}, Errorf(INTERNAL_ERROR, "failed to read config: %s", err.Error())
		}
	}

	var config Config

	return config, viper.Unmarshal(&config)
}

func setDefaults() {}
