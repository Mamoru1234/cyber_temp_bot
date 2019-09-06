package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.request.GetUpdates
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

class BotWrapper(token: String) {
    private val bot = TelegramBot(token)
    private val updatesExecutor = Executors.newSingleThreadExecutor()
    private val shouldRun = AtomicBoolean(true)

    public fun start() {
        updatesExecutor.submit {
            var lastUpdateId = 0
            while (shouldRun.get()) {
                val getUpdatesResponse = bot.execute(GetUpdates().limit(10).offset(lastUpdateId))
                if (!getUpdatesResponse.isOk) {
                    println("Wrong response")
                    continue
                }
                val updates = getUpdatesResponse.updates()
                if (updates.size == 0) {
                    continue
                }
                for (update in updates) {
                    println(update.message().text())
                }
                lastUpdateId = updates.last().updateId() + 1
            }
        }
    }

    public fun stop() {
        shouldRun.set(false)
        updatesExecutor.shutdown()
        updatesExecutor.awaitTermination(1, TimeUnit.MINUTES)
    }
}
