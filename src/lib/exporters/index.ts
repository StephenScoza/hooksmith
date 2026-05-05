import { serializePayload, type DiscordWebhookPayload } from '../discord';

export type ExportFormat = {
  id: string;
  label: string;
  language: string;
  build: (payload: DiscordWebhookPayload) => string;
};

function jsonLiteral(payload: DiscordWebhookPayload) {
  return serializePayload(payload);
}

function indentedJson(payload: DiscordWebhookPayload, spaces: number) {
  return JSON.stringify(JSON.parse(jsonLiteral(payload)) as object, null, spaces);
}

function shellEscapeSingleQuotes(value: string) {
  return value.split("'").join("'\\''");
}

export const exportFormats: ExportFormat[] = [
  {
    id: 'json',
    label: 'JSON',
    language: 'json',
    build: (payload) => jsonLiteral(payload)
  },
  {
    id: 'curl',
    label: 'cURL',
    language: 'bash',
    build: (payload) => `curl -X POST "$WEBHOOK_URL" \\
  -H "Content-Type: application/json" \\
  -d '${shellEscapeSingleQuotes(jsonLiteral(payload))}'`
  },
  {
    id: 'javascript',
    label: 'JavaScript fetch',
    language: 'javascript',
    build: (payload) => `const webhookUrl = process.env.WEBHOOK_URL;
const payload = ${indentedJson(payload, 2)};

const response = await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  throw new Error(\`Discord webhook failed: \${response.status} \${response.statusText}\`);
}`
  },
  {
    id: 'node',
    label: 'Node.js',
    language: 'javascript',
    build: (payload) => `const webhookUrl = process.env.WEBHOOK_URL;
const payload = ${indentedJson(payload, 2)};

async function sendWebhook() {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(\`Discord webhook failed: \${response.status} \${response.statusText}\`);
  }
}

sendWebhook().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`
  },
  {
    id: 'python',
    label: 'Python requests',
    language: 'python',
    build: (payload) => `import os
import requests

webhook_url = os.environ["WEBHOOK_URL"]
payload = ${indentedJson(payload, 2)}

response = requests.post(webhook_url, json=payload, timeout=15)
response.raise_for_status()`
  },
  {
    id: 'go',
    label: 'Go',
    language: 'go',
    build: (payload) => `package main

import (
  "bytes"
  "fmt"
  "io"
  "net/http"
  "os"
)

func main() {
  webhookURL := os.Getenv("WEBHOOK_URL")
  payload := []byte(${JSON.stringify(jsonLiteral(payload))})

  req, err := http.NewRequest(http.MethodPost, webhookURL, bytes.NewBuffer(payload))
  if err != nil {
    panic(err)
  }

  req.Header.Set("Content-Type", "application/json")

  resp, err := http.DefaultClient.Do(req)
  if err != nil {
    panic(err)
  }
  defer resp.Body.Close()

  if resp.StatusCode >= 300 {
    body, _ := io.ReadAll(resp.Body)
    panic(fmt.Sprintf("discord webhook failed: %s %s", resp.Status, string(body)))
  }
}`
  },
  {
    id: 'php',
    label: 'PHP',
    language: 'php',
    build: (payload) => `<?php

$webhookUrl = getenv('WEBHOOK_URL');
$payload = ${jsonLiteral(payload)};

$ch = curl_init($webhookUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
    CURLOPT_RETURNTRANSFER => true,
]);

$result = curl_exec($ch);

if ($result === false) {
    throw new RuntimeException(curl_error($ch));
}

$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($statusCode >= 300) {
    throw new RuntimeException('Discord webhook failed with status ' . $statusCode);
}`
  },
  {
    id: 'csharp',
    label: 'C#',
    language: 'csharp',
    build: (payload) => `using System.Net.Http;
using System.Text;

var webhookUrl = Environment.GetEnvironmentVariable("WEBHOOK_URL")
    ?? throw new InvalidOperationException("WEBHOOK_URL is not set.");

var payload = """
${jsonLiteral(payload)}
""";

using var client = new HttpClient();
using var content = new StringContent(payload, Encoding.UTF8, "application/json");
var response = await client.PostAsync(webhookUrl, content);
response.EnsureSuccessStatusCode();`
  },
  {
    id: 'java',
    label: 'Java',
    language: 'java',
    build: (payload) => `import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class DiscordWebhookExample {
  public static void main(String[] args) throws IOException, InterruptedException {
    String webhookUrl = System.getenv("WEBHOOK_URL");
    String payload = """
${jsonLiteral(payload)}
""";

    HttpRequest request = HttpRequest.newBuilder(URI.create(webhookUrl))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(payload))
        .build();

    HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

    if (response.statusCode() >= 300) {
      throw new RuntimeException("Discord webhook failed: " + response.statusCode() + " " + response.body());
    }
  }
}`
  }
];
