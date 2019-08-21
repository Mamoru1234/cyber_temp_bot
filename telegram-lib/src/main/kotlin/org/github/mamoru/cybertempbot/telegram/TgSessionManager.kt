package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Message
import com.pengrad.telegrambot.model.Update
import org.springframework.stereotype.Component
import java.util.concurrent.Executors

typealias SimpleMessageHandler = (session: TgSession, message: Message) -> Unit

@Component
class TgSessionManager(
        private val bot: TelegramBot,
        private val tgMessageParser: TgMessageParser) {
    private val sessions = mutableMapOf<String, TgSession>()
    private val executor = Executors.newFixedThreadPool(10)
    private val handlers = mutableListOf<TgMessageHandler>()
    private val commandHandlers = mutableMapOf<String, SimpleMessageHandler>()
    private var unknownHandler: SimpleMessageHandler? = null

    fun handleUpdate(update: Update) {
        val sessionId = getSessionId(update)
        if (!sessions.containsKey(sessionId)) {
            sessions[sessionId] = TgSession(bot, executor, update)
        }
        val session = sessions.getValue(sessionId)
        session.execute {
            val message = update.message()
            if (checkCommands(session, message)) {
                return@execute
            }
            if (checkHandlers(session, message)) {
                return@execute
            }
            unknownHandler?.let { it(session, message) }
        }
    }

    private fun checkCommands(session: TgSession, message: Message): Boolean {
        if (commandHandlers.isEmpty()) {
            return false
        }
        val commands = tgMessageParser.getCommands(message)
        if (commands.size > 1) {
            session.sendText("Cannot use more than 1 command, sorry")
            return true
        }
        val command = commands.firstOrNull() ?: return false
        return commandHandlers[command]
                ?.let {
                    it(session, message)
                    true
                } ?: false
    }

    private fun checkHandlers(session: TgSession, message: Message): Boolean {
        for (handler in handlers) {
            if (!handler.canHandle(message)) {
                continue
            }
            handler.handle(session, message)
            return true
        }
        return false
    }

    private fun getSessionId(update: Update): String = update.message().chat().id().toString()

    fun registerUnknownHandler(unknownHandler: SimpleMessageHandler) {
        this.unknownHandler = unknownHandler
    }

    fun registerCommand(command: String, handler: SimpleMessageHandler) {
        if (commandHandlers.containsKey(command)) {
            throw RuntimeException("Cannot register handler twice")
        }
        this.commandHandlers[command] = handler
    }

    fun registerHandler(handler: TgMessageHandler) {
        handlers.add(handler)
    }
}
