package org.github.mamoru.cybertempbot.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties("cyber.temp.bot")
class CyberTempBotProps {
    lateinit var mqttUrl: String
    lateinit var dataTopic: String
    lateinit var botAuthToken: String
}
