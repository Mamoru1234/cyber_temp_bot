package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Update
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BotConfiguration {
    @Bean
    fun tgBot(): TelegramBot {
        return TelegramBot("")
    }

    @Bean
    fun tgSessionManager(bot: TelegramBot, tgSessionFactory: TgSessionFactory): TgSessionManager {
        return TgSessionManager(bot, tgSessionFactory)
    }
}
