package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.model.Message

interface TgMessageHandler {
    fun canHandle(message: Message): Boolean
    fun handle(message: Message)
}

class RegExpTgMessageHandler(private val regex: Regex, private val handler: (message: Message) -> Unit): TgMessageHandler {
    override fun canHandle(message: Message): Boolean {
        return regex.containsMatchIn(message.text())
    }

    override fun handle(message: Message) {
        handler(message)
    }
}
