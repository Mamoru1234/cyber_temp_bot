package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.UpdatesListener
import org.springframework.context.annotation.Configuration
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy

@Configuration
class BotSetup(private val bot: TelegramBot, private val tgSessionManager: TgSessionManager) {
    @PostConstruct
    fun setup() {
        bot.setUpdatesListener {
            for(update in it) {
                tgSessionManager.handleUpdate(update)
            }
            UpdatesListener.CONFIRMED_UPDATES_ALL
        }
    }

    @PreDestroy
    fun destroy() {
        bot.removeGetUpdatesListener()
    }
}
