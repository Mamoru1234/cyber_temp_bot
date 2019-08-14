package org.github.mamoru.cybertempbot.telegram

import com.pengrad.telegrambot.TelegramBot
import com.pengrad.telegrambot.model.Update
import org.github.mamoru.cybertempbot.telegram.annotation.UnknownTgMessageHandler
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.context.annotation.Bean
import org.springframework.stereotype.Service
import kotlin.reflect.full.findAnnotation
import kotlin.reflect.full.memberFunctions

@Service
class TgHandlerProcessor(private val tgMessageHandlerRepository: TgMessageHandlerRepository): BeanPostProcessor {
    override fun postProcessAfterInitialization(bean: Any, beanName: String): Any? {
        bean::class.memberFunctions.forEach {
            method ->
            val annotation = method.findAnnotation<UnknownTgMessageHandler>()
            if (annotation != null) {
                println("Detected unknown handler")
                tgMessageHandlerRepository.register {
                    session ->
                    { update ->
                        method.call(bean, session)
                    }
                }
            }
        }
        return super.postProcessAfterInitialization(bean, beanName)
    }
}
