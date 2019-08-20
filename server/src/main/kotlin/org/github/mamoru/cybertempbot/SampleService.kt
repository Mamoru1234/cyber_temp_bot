package org.github.mamoru.cybertempbot

import com.pengrad.telegrambot.model.Message
import org.github.mamoru.cybertempbot.telegram.TgSession
import org.github.mamoru.cybertempbot.telegram.annotation.RegExpTgHandler
import org.github.mamoru.cybertempbot.telegram.annotation.UnknownTgHandler
import org.springframework.stereotype.Service

@Service
class SampleService {
    @UnknownTgHandler
    fun test(session: TgSession, message: Message) {
        session.sendText("Hello test ${message.text()}")
    }

    @RegExpTgHandler("/start")
    fun start(session: TgSession, message: Message) {
        session.sendText("Start ${message.text()}")
    }
}
