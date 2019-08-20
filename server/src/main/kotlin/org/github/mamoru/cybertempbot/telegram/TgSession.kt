package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Message
import com.pengrad.telegrambot.model.Update
import com.pengrad.telegrambot.request.SendMessage
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors


class TgSession(private val bot: TelegramBot, private val update: Update) {
    private val sessionExecutor = Executors.newSingleThreadExecutor()

    val sessionId: Long = update.message().chat().id()

//    fun handleUpdate(update: Update) {
//        sessionExecutor.execute {
//            for (handler in handlers) {
//                val message = update.message()
//                if (handler.canHandle(message)) {
//                    handler.handle(message)
//                    return@execute
//                }
//            }
//            unknownHandler?.let { it(update) }
//        }
//    }

    fun execute(task: () -> Unit) {
        sessionExecutor.submit(task)
    }

    fun sendText(text: String): CompletableFuture<Message> {
        val sendMessage = SendMessage(sessionId, text)
        val result = CompletableFuture<Message>()
        sessionExecutor.submit {
            val response = bot.execute(sendMessage)
            if (response.isOk) {
                result.complete(response.message())
                return@submit
            }
            result.completeExceptionally(RuntimeException("${response.errorCode()}"))
        }
        return result
    }

//    fun registerUnknownHandler(unknownHandler: UnknownMessageHandler) {
//        this.unknownHandler = unknownHandler
//    }

//    fun registerHandler(handler: TgMessageHandler) {
//        handlers.add(handler)
//    }
}
