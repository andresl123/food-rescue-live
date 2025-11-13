# --- STAGE 1: Build ---
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# 1. Copy pom.xml
COPY pom.xml .

# 2. Mount secret, create settings.xml, run go-offline
RUN --mount=type=secret,id=GH_PACKAGES_TOKEN \
    mkdir -p ~/.m2 && \
    echo "<settings><servers><server><id>github</id><username>its-harmeet-singh</username><password>$(cat /run/secrets/GH_PACKAGES_TOKEN)</password></server></servers></settings>" > ~/.m2/settings.xml && \
    mvn -e dependency:go-offline && \
    rm ~/.m2/settings.xml

# 3. Copy source
COPY src ./src

# 4. Build
RUN mvn package -DskipTests

# --- STAGE 2: Run ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Based on your POM
ARG JAR_FILE_NAME=jobs-service-0.0.1-SNAPSHOT.jar

COPY --from=build /app/target/${JAR_FILE_NAME} app.jar

# Port from your properties
EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]