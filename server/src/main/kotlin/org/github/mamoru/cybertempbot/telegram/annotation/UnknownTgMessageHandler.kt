package org.github.mamoru.cybertempbot.telegram.annotation

@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION,
        AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
annotation class UnknownTgMessageHandler
