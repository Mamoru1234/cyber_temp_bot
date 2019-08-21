package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Update

interface TgSessionFactory {
    fun createSession(bot: TelegramBot, update: Update): TgSession
}
