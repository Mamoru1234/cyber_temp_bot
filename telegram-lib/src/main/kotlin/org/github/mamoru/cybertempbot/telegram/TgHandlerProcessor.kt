package org.github.mamoru.cybertempbot.telegram

import mu.KotlinLogging
import org.github.mamoru.cybertempbot.telegram.annotation.RegExpTgHandler
import org.github.mamoru.cybertempbot.telegram.annotation.TgCommandHandler
import org.github.mamoru.cybertempbot.telegram.annotation.UnknownTgHandler
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.stereotype.Service
import kotlin.reflect.full.findAnnotation
import kotlin.reflect.full.memberFunctions

@Service
class TgHandlerProcessor(private val tgSessionManager: TgSessionManager): BeanPostProcessor {
    private val logger = KotlinLogging.logger {}

    override fun postProcessAfterInitialization(bean: Any, beanName: String): Any? {
        bean::class.memberFunctions.forEach {
            method ->
            val unknownTgMessageHandler = method.findAnnotation<UnknownTgHandler>()
            if (unknownTgMessageHandler != null) {
                logger.info("Detected unknown handler ${bean.javaClass.name} ${method.name}")
                tgSessionManager.registerUnknownHandler { session, message ->
                    method.call(bean, session, message)
                }
            }
            val regExpTgMessageHandler = method.findAnnotation<RegExpTgHandler>()
            if (regExpTgMessageHandler != null) {
                logger.info("Detected regexp handler: ${regExpTgMessageHandler.regExp} ${bean.javaClass.name} ${method.name}")
                val handler = RegExpTgMessageHandler(Regex(regExpTgMessageHandler.regExp)) {
                    session, message ->
                    method.call(bean, session, message)
                }
                tgSessionManager.registerHandler(handler)
            }
            val commandMessageHandler = method.findAnnotation<TgCommandHandler>()
            if (commandMessageHandler != null) {
                logger.info("Command handler ${commandMessageHandler.command} ${bean.javaClass.name} ${method.name}")
                tgSessionManager.registerCommand(commandMessageHandler.command) {
                    session, message -> method.call(bean, session, message)
                }
            }
        }
        return super.postProcessAfterInitialization(bean, beanName)
    }
}
