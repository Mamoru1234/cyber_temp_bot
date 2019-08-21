package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import org.github.mamoru.cybertempbot.telegram.properties.TelegramBotProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration

@Configuration
@ComponentScan
class BotConfiguration(private val props: TelegramBotProperties) {
    @Bean
    fun tgBot(): TelegramBot {
        return TelegramBot(props.token)
    }
}
