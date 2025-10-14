package com.foodrescue.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableReactiveMongoAuditing;

@SpringBootApplication
@EnableReactiveMongoAuditing
public class AuthUsersServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthUsersServiceApplication.class, args);
	}

}
//package com.foodrescue.auth;
//
//import com.courier.api.Courier;
//import com.courier.api.requests.SendMessageRequest;
//import com.courier.api.resources.send.types.Content; // <-- We already had this, but now we use its .of() method
//import com.courier.api.resources.send.types.ContentMessage;
//import com.courier.api.resources.send.types.Message;
//import com.courier.api.resources.send.types.MessageRecipient;
//import com.courier.api.resources.send.types.Recipient;
//import com.courier.api.resources.send.types.UserRecipient;
//import com.courier.api.resources.send.types.ElementalContentSugar;
//
//import java.io.IOException;
//import java.util.Map;
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.data.mongodb.config.EnableReactiveMongoAuditing;
//
//@SpringBootApplication
//@EnableReactiveMongoAuditing
//public class AuthUsersServiceApplication {
//
//    public static void main(String[] args) {
//        Courier courier = Courier.builder()
//                .authorizationToken("pk_prod_JEA5HFS17047MFMNMK5NE9NHZR3Q")
//                .build();
//
//        courier.send(SendMessageRequest.builder()
//                .message(Message.of(ContentMessage.builder()
//                        // --- FINAL CORRECTED SECTION ---
//                        // Wrap the ElementalContentSugar object in Content.of()
//                        .content(Content.of(ElementalContentSugar.builder()
//                                .title("Welcome!")
//                                .body("Hello {{name}}, welcome to our platform!")
//                                .build()))
//                        // -----------------------------
//                        .to(MessageRecipient.of(Recipient.of(UserRecipient.builder()
//                                .email("andreslopes2009@gmail.com")
//                                .build())))
//                        .data(Map.of("name", "Peter Parker"))
//                        .build()))
//                .build());
//
//        System.out.println("Notification sent successfully.");
//
//    }
//}