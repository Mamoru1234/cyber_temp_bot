package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Update
import org.springframework.stereotype.Service

typealias TempSessionHandler = (session: TgSession) -> (update: Update) -> Unit

@Service
class TgMessageHandlerRepository: TgSessionFactory {
    private var unknownMessageHandler: TempSessionHandler? = null

    override fun createSession(bot: TelegramBot, update: Update): TgSession {
        val tgSession = TgSession(bot, update)
        unknownMessageHandler?.let { tgSession.registerUnknownHandler(it(tgSession)) }
        return tgSession
    }

    fun register(handler: TempSessionHandler) {
        this.unknownMessageHandler = handler;
    }
}
