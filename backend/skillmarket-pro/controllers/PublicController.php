<?php
class PublicController
{
    public static function landing(): void
    {
        // Landing has its own full HTML — render directly
        view('landing', [], false);
    }

    public static function howItWorks(): void
    {
        publicView('how-it-works', ['__title' => 'How It Works']);
    }

    public static function features(): void
    {
        publicView('features', ['__title' => 'Features']);
    }

    public static function skillSwapInfo(): void
    {
        publicView('skill-swap-info', ['__title' => 'Skill Swap']);
    }

    public static function forEmployers(): void
    {
        publicView('for-employers', ['__title' => 'For Employers']);
    }
}
