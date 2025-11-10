# --- STAGE 1: Build ---
# Use a Java 17 JDK image that supports multi-arch (amd64, arm64)
FROM eclipse-temurin:17-jdk-jammy AS build

# Set the working directory
WORKDIR /app

# 1. Copy only the pom.xml to download and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# 2. Copy the rest of your source code
COPY src ./src

# 3. Build the application and skip tests
RUN mvn package -DskipTests

# --- STAGE 2: Run ---
# Use a lightweight JRE image for the final, small container
FROM eclipse-temurin:17-jre-jammy

# Set the working directory
WORKDIR /app

# Argument to hold the name of your jar file
# You MUST change this to match the name in your pom.xml!
ARG JAR_FILE_NAME=auth-users-service-0.0.1-SNAPSHOT.jar

# Copy the built .jar file from the 'build' stage
COPY --from=build /app/target/${JAR_FILE_NAME} app.jar

# Expose the port your application runs on (default for Spring Boot is 8080)
EXPOSE 8080

# Command to run your application
ENTRYPOINT ["java", "-jar", "app.jar"]