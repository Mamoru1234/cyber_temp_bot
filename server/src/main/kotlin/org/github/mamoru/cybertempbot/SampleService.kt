package org.github.mamoru.cybertempbot

import org.github.mamoru.cybertempbot.telegram.TgSession
import org.github.mamoru.cybertempbot.telegram.annotation.UnknownTgMessageHandler
import org.springframework.stereotype.Service

@Service
class SampleService {
    @UnknownTgMessageHandler
    fun test(session: TgSession) {
        session.sendText("Hello test")
    }
}
