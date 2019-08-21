package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.model.Message
import com.pengrad.telegrambot.model.MessageEntity
import org.springframework.stereotype.Component

@Component
class TgMessageParser {
    fun getCommands(message: Message): List<String> {
        val messageText = message.text()
        return message.entities()
                .filter { it.type() == MessageEntity.Type.bot_command }
                .map { messageText.substring(it.offset() + 1, it.offset() + it.length()) }
    }
}
