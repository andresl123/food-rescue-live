# --- STAGE 1: Build ---
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# 1. Copy POM and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# 2. Copy source and build
COPY src ./src
RUN mvn package -DskipTests

# --- STAGE 2: Run ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# !! IMPORTANT: Update this with the name from your pom.xml !!
ARG JAR_FILE_NAME=ui-bff-0.0.1-SNAPSHOT.jar

COPY --from=build /app/target/${JAR_FILE_NAME} app.jar

# Expose the port your BFF runs on (I'm assuming 8090)
EXPOSE 8090

ENTRYPOINT ["java", "-jar", "app.jar"]