# --- STAGE 1: Build ---
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# 1. Copy POM and cache dependencies
COPY pom.xml .

# 2. Mount the PAT secret, create settings.xml with the hard-coded username,
#    run go-offline, and then remove the settings file for security.
RUN --mount=type=secret,id=GH_PACKAGES_TOKEN \
    mkdir -p ~/.m2 && \
    echo "<settings><servers><server><id>github</id><username>its-harmeet-singh</username><password>$(cat /run/secrets/GH_PACKAGES_TOKEN)</password></server></servers></settings>" > ~/.m2/settings.xml && \
    mvn -e dependency:go-offline && \
    rm ~/.m2/settings.xml

# 2. Copy source and build
COPY src ./src
RUN mvn package -DskipTests

# --- STAGE 2: Run ---
FROM eclipse-temurin:17-jre-jammy

# Create a system user and group to run as non-root
RUN addgroup --system javauser && adduser --system --shell /usr/sbin/nologin --ingroup javauser javauser

WORKDIR /app

# !! IMPORTANT: Update this with the name from your pom.xml !!
ARG JAR_FILE_NAME=ui-bff-0.0.1-SNAPSHOT.jar

COPY --from=build --chown=javauser:javauser /app/target/${JAR_FILE_NAME} app.jar

# Switch to the non-root user
USER javauser

# Expose the port your BFF runs on (I'm assuming 8090)
EXPOSE 8090

ENTRYPOINT ["java", "-jar", "app.jar"]