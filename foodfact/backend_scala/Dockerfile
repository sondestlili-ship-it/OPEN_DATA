FROM sbtscala/scala-sbt:graalvm-ce-21.3.0-java17_1.9.0_3.3.1

WORKDIR /app
COPY build.sbt ./
COPY project ./project
COPY src ./src

EXPOSE 8080

ENV PORT=8080
ENV CORS_ORIGINS=http://localhost:3000

CMD ["sbt", "run"]
