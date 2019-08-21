package org.github.mamoru.cybertempbot.telegram.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties("mamoru.tg")
class TelegramBotProperties {
    lateinit var token: String
}
