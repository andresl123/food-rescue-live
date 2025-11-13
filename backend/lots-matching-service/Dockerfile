# --- STAGE 1: Build ---
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# 1. Copy pom.xml
COPY pom.xml .

# 2. Mount the PAT secret, create settings.xml, run go-offline, and clean up
RUN --mount=type=secret,id=GH_PACKAGES_TOKEN \
    mkdir -p ~/.m2 && \
    echo "<settings><servers><server><id>github</id><username>its-harmeet-singh</username><password>$(cat /run/secrets/GH_PACKAGES_TOKEN)</password></server></servers></settings>" > ~/.m2/settings.xml && \
    mvn -e dependency:go-offline && \
    rm ~/.m2/settings.xml

# 3. Copy the rest of your source code
COPY src ./src

# 4. Build the application and skip tests
RUN mvn package -DskipTests

# --- STAGE 2: Run ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# This name is based on your pom.xml
ARG JAR_FILE_NAME=lots-matching-service-0.0.1-SNAPSHOT.jar

COPY --from=build /app/target/${JAR_FILE_NAME} app.jar

# Your lots-service runs on port 8081
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]