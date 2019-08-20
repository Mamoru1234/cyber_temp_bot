package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Update

typealias UnknownMessageHandler = (session: TgSession, update: Update) -> Unit

class TgSessionManager(private val bot: TelegramBot) {
    private val sessions = mutableMapOf<String, TgSession>()
    private val handlers = mutableListOf<TgMessageHandler>()
    private var unknownHandler: UnknownMessageHandler? = null

    fun handleUpdate(update: Update) {
        val sessionId = getSessionId(update)
        if (!sessions.containsKey(sessionId)) {
            sessions[sessionId] = TgSession(bot, update)
        }
        val session = sessions.getValue(sessionId)
        session.execute {
            val message = update.message()
            for (handler in handlers) {
                if (!handler.canHandle(message)) {
                    continue
                }
                handler.handle(session, message)
                return@execute
            }
            unknownHandler?.let { it(session, update) }
        }
    }

    private fun getSessionId(update: Update): String = update.message().chat().id().toString()

    fun registerUnknownHandler(unknownHandler: UnknownMessageHandler) {
        this.unknownHandler = unknownHandler
    }

    fun registerHandler(handler: TgMessageHandler) {
        handlers.add(handler)
    }
}
