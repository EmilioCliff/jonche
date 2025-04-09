package main

import (
	"bytes"
	"fmt"
	"text/template"
)

type Customer struct {
	Name    string
	Balance float64
}

func GenerateMessages(templateText string, customers []Customer) ([]string, error) {
	tmpl, err := template.New("sms").Parse(templateText)
	if err != nil {
		return nil, err
	}

	var messages []string
	for _, customer := range customers {
		var msgBuffer bytes.Buffer
		err := tmpl.Execute(&msgBuffer, customer)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msgBuffer.String())
	}

	return messages, nil
}

func main() {
	templateText := "Hello {{.name}}, we have received your payment. Your new balance is KES {{.Balance}}. Thank you!"

	customers := []Customer{
		{Name: "John", Balance: 3500.0},
		{Name: "Alice", Balance: 1200.0},
	}

	messages, err := GenerateMessages(templateText, customers)
	if err != nil {
		panic(err)
	}

	for _, msg := range messages {
		fmt.Println(msg)
	}
}
