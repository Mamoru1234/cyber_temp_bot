package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Update

class TgSessionManager(private val bot: TelegramBot, private val sessionFactory: TgSessionFactory) {
    private val sessions = mutableMapOf<String, TgSession>()

    fun handleUpdate(update: Update) {
        val sessionId = getSessionId(update)
        if (sessions.containsKey(sessionId)) {
            sessions.getValue(sessionId).handleUpdate(update)
            return
        }
        val session = sessionFactory.createSession(bot, update)
        sessions[sessionId] = session;
        session.handleUpdate(update)
    }

    private fun getSessionId(update: Update): String = update.message().chat().id().toString()
}
