package org.github.mamoru.cybertempbot.telegram

import com.google.common.util.concurrent.MoreExecutors
import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Message
import com.pengrad.telegrambot.model.Update
import com.pengrad.telegrambot.request.SendMessage
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executor


class TgSession(private val bot: TelegramBot, executor: Executor, private val update: Update) {
    private val sessionExecutor = MoreExecutors.newSequentialExecutor(executor)

    val sessionId: Long = update.message().chat().id()

    fun execute(task: () -> Unit) {
        sessionExecutor.execute(task)
    }

    fun sendText(text: String): CompletableFuture<Message> {
        val result = CompletableFuture<Message>()
        sessionExecutor.execute {
            val sendMessage = SendMessage(sessionId, text)
            val response = bot.execute(sendMessage)
            if (response.isOk) {
                result.complete(response.message())
                return@execute
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
