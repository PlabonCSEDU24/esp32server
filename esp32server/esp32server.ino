#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
const char* ssid = "ESP32";
const char* password = "password";
#define LED_BUILTIN 2

#define in1 13
#define in2 12
#define in3 14
#define in4 27

#define enA 26
#define enB 25


#define RXD2 16
#define TXD2 17



// We want to periodically send values to the clients, so we need to define an "interval" and remember the last time we sent data to the client (with "previousMillis")
//int interval = 1000;                                  // send data to the client every 1000ms -> 1s
//unsigned long previousMillis = 0;                     

// Initialization of webserver and websocket
WebServer server(80);                                 // the server uses port 80 (standard port for websites
WebSocketsServer webSocket = WebSocketsServer(81);    // the websocket uses port 81 (standard port for websockets

void setup() {
  Serial.begin(115200);                               // init serial port for debugging
  Serial2.begin(115200,SERIAL_8N1,RXD2,TXD2);         //we'll use this one to communicate with stm32
  Serial2.write('a');
  Serial2.println("HELLO");
  
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(enA , OUTPUT);
  pinMode(enB , OUTPUT);
  pinMode(in1 , OUTPUT);
  pinMode(in2 , OUTPUT);
  pinMode(in3 , OUTPUT);
  pinMode(in4 , OUTPUT);
  
  Serial.print("Starting Access Point ... ");
  Serial.println(WiFi.softAP(ssid, password) ? "Ready" : "Failed!");
  Serial.print("IP address = ");
  Serial.println(WiFi.softAPIP());

  //API's
  server.on("/", []() {                               
    server.send(200, "text/json", "{\"name\": \"Hi there!\"}");          
  });
  server.begin();                                     // start server
  
  webSocket.begin();                                  // start websocket
  webSocket.onEvent(webSocketEvent);                  // define a callback function -> what does the ESP32 need to do when an event from the websocket is received? -> run function "webSocketEvent()"
}

void loop() {
  server.handleClient();                              // Needed for the webserver to handle all clients
  webSocket.loop();  

  Serial2.println("HELLO");
  Serial2.write("h");
}
  

void webSocketEvent(byte num, WStype_t type, uint8_t * payload, size_t length) { 
  switch (type) {                                     // switch on the type of information sent
    case WStype_DISCONNECTED:                         // if a client is disconnected, then type == WStype_DISCONNECTED
      Serial.println("Client " + String(num) + " disconnected");
      break;
    case WStype_CONNECTED:                            // if a client is connected, then type == WStype_CONNECTED
      Serial.println("Client " + String(num) + " connected");
      // optionally you can add code here what to do when connected
      break;
    case WStype_TEXT:                                 // if a client has sent data, then type == WStype_TEXT
      // try to decipher the JSON string received
      StaticJsonDocument<200> doc;                    // create a JSON container
      DeserializationError error = deserializeJson(doc, payload);
      if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        return;
      }
      else {
        // JSON string was received correctly, so information can be retrieved:
        const char* terminal = doc["term"];
        const int x = doc["x"];
        const int y = doc["y"];
        // Serial.println("Received data from client: " + String(num));
        // Serial.println("term: " + String(terminal)); 
        // Serial.println("x: " + String(x));
        // Serial.println("y: " + String(y));

        drive(x,y);

      }
      Serial.println("");
      break;
  }
}

void drive(int x, int y){
  int vel = sqrt(x*x+y*y);
  vel = map (vel,0,106,60,100);
  Serial.print("v:" );
  Serial.println(vel);
  if(y>5){
     forward();
     if(x>0){
        x=map(x,0,106,0,100);
        int enA_val = 256 * (vel/100.0);
        int enB_val = 256 * (vel-x)/100.0;
        analogWrite(enA,enA_val);
        analogWrite(enB,enB_val);
     }
     else{

       x=map(x,0,-106,0,100);
        int enA_val = 256 * (vel-x)/100.0;
        int enB_val = 256 * (vel/100.0);
        analogWrite(enA,enA_val);
        analogWrite(enB,enB_val);

      }
      
   }
  if(y<-5){
     backward();
     if(x>0){
        x=map(x,0,106,0,100);
        int enA_val = 256 * (vel/100.0);
        int enB_val = 256 * (vel-x)/100.0;    
        analogWrite(enA,enA_val);
        analogWrite(enB,enB_val);
     }
     else{
        x=map(x,0,-106,0,100);     
        int enA_val = 256 * (vel-x)/100.0;
        int enB_val = 256 * (vel/100.0);
        analogWrite(enA,enA_val);
        analogWrite(enB,enB_val);

      }
    }

   if(y<5 && y>-5){
    stop();
    }
  }

void forward(){
    digitalWrite(in1 , HIGH);
    digitalWrite(in2 , LOW);
    digitalWrite(in3 , HIGH);
    digitalWrite(in4 , LOW);
  }
void backward(){
    digitalWrite(in1 , LOW);
    digitalWrite(in2 , HIGH);
    digitalWrite(in3 , LOW);
    digitalWrite(in4 , HIGH);
  }

void stop(){
    digitalWrite(in1 , LOW);
    digitalWrite(in2 , LOW);
    digitalWrite(in3 , LOW);
    digitalWrite(in4 , LOW);
  } 

//  unsigned long now = millis();                       // read out the current "time" ("millis()" gives the time in ms since the Arduino started)
//  if ((unsigned long)(now - previousMillis) > interval) { // check if "interval" ms has passed since last time the clients were updated
//    
//    String jsonString = "";                           // create a JSON string for sending data to the client
//    StaticJsonDocument<200> doc;                      // create a JSON container
//    JsonObject object = doc.to<JsonObject>();         // create a JSON Object
//    object["rand1"] = random(100);                    // write data into the JSON object -> I used "rand1" and "rand2" here, but you can use anything else
//    object["rand2"] = random(100);
//    serializeJson(doc, jsonString);                   // convert JSON object to string
//    Serial.println(jsonString);                       // print JSON string to console for debug purposes (you can comment this out)
//    webSocket.broadcastTXT(jsonString);               // send JSON string to clients
//    previousMillis = now;                             // reset previousMillis
//  }
//}
