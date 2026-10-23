# Privacy Policy

Version: 1.0

Last updated: 23 October 2026

This is a translation. The German version is legally binding.

Here you can find out which personal data we process when you use the Loqqa app, why we do so and what rights you have. This is based on the General Data Protection Regulation (GDPR), the German Federal Data Protection Act (BDSG) and the German Telecommunications Digital Services Data Protection Act (TDDDG).

## In short

- Loqqa first stores your plans and workouts on your device and syncs them with your account as soon as you are online. Our database is located in Frankfurt am Main.
- Other users cannot see your profile, your workouts or your photos.
- We treat your weight, your height and your body check photos as health data. We only process them with your explicit consent.
- For plan creation, plan import and the body check, we use an AI model from OpenAI. For this, we transfer the necessary data to OpenAI, which processes it in the USA.
- To improve the app, we use PostHog to measure how it is used. Health data and photos are not sent to PostHog. The app contains no advertising.
- You can delete your account in the app at any time. This also deletes your photos and all data in your account.

## 1. Who is responsible?

The controller responsible for processing your data is:

- Jan Timo Hünnebeck
- Adamstr. 5, 80636 Munich, Germany
- Email: support@itsloqqa.com

Below, we refer to ourselves as “we”.

## 2. Data protection officer

We have not appointed a data protection officer because we are not required to do so. You can contact us directly at support@itsloqqa.com with any questions about data protection.

## 3. How Loqqa works

Loqqa is a training app. You can have a training plan created for you or import an existing one, log your workouts and your body weight and, from age 18, do body checks with photos.

The app works “offline first”: your data is kept in a database on your device so that you can train even without internet. When you are signed in and online, the app syncs this data with your account on our servers. This way, your plan and your history are backed up and available on all your devices. For the servers, we use service providers (section 7).

All data in our database is assigned to your account. Technical access rules ensure that only you can read and change your own data. Loqqa has no features that let other users see your profile, your workouts or your photos.

## 4. Which data we process and why

### 4.1 Setup without an account

You go through setup without an account. During setup, the app loads the exercise catalog (names, instructions, images and videos of the exercises) and these legal texts from our servers. It checks the exercise catalog for changes at startup and every hour after that. Only technically necessary connection data is generated in the process (section 4.12).

The app initially stores your answers during setup (for example first name, sex, date of birth, weight, height, goal and the created or imported plan) only on your device. This information is only sent to us when you create an account (sections 4.3 and 4.4). Exceptions: if you have a plan created for you, the app transfers your answers on goal, focus, equipment, workouts per week, workout duration and experience beforehand so that the plan can be created; it transfers photos and files from which you import a plan so that the plan can be recognized (both section 4.7).

Legal basis: Art. 6(1)(b) GDPR (providing the app you want to use).

### 4.2 Your account

At the end of setup, you create an account with an email address and password or sign in with your Google account or your Apple Account. In doing so, we process:

- your email address and your password (we store the password only as a cryptographic hash, never in plain text; if you sign in with Google or Apple, there is no password with us)
- your first name and your app language: the language so that account emails reach you in your language, the first name so that the app can fill it in again after you sign in on a new device
- technical account data such as the time of registration and of the last sign-in, as well as sign-in tokens

We send you emails that are necessary for your account, for example a six-digit code to reset your password. Supabase handles the sending (section 7).

To keep you signed in, the app stores your sign-in session on your device.

**Sign in with Google:** When you choose “Google”, Google’s sign-in opens on your device. Google then confirms your sign-in to us and transfers your email address, your name, the address of your Google profile picture and an identifier of your Google account to us. We store this information with your account. Google learns in the process that you are signing in to Loqqa. Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland, is independently responsible for signing in via your Google account; [Google’s Privacy Policy](https://policies.google.com/privacy?hl=en) applies.

**Sign in with Apple** (only on Apple devices): When you choose “Apple”, Apple’s sign-in opens on your device. Apple then confirms your sign-in to us and transfers an identifier of your Apple Account and your email address to us. Instead, you can choose an address generated by Apple that forwards emails to you (“Hide My Email”). On the first sign-in, Apple also transfers your name if you share it. We store this information with your account. Apple Distribution International Limited, Hollyhill Industrial Estate, Hollyhill, Cork, Ireland, is independently responsible for signing in via your Apple Account; [Apple’s Privacy Policy](https://www.apple.com/legal/privacy/en-ww/) applies.

Accounts are only created at the end of setup. If signing in with Google or Apple on the sign-in screen would create a new account, the app deletes it again immediately and tells you that there is no account yet.

Legal basis: Art. 6(1)(b) GDPR.

### 4.3 Profile and training planning

When you create an account, we store your information from setup as your profile. You can change some of it later in the settings and in your profile.

- first name, biological sex (“Prefer not to say” is also possible) and date of birth
- body weight, height and your preferred units (metric or imperial)
- training experience, training goal, focus muscle groups, available equipment, workouts per week and desired workout duration
- your app language, so that our support can reply to you in your language
- optional: a profile photo (the app stores it as a square image of 512 × 512 pixels) and a short “About you” text of up to 150 characters

Why: We need your date of birth to check the minimum age (section 16) and the age limit for the body check. If you have a training plan created for you, an AI model from OpenAI creates it from your training goal, focus, equipment, workouts per week, workout duration and experience (section 4.7). The app uses sex, age, weight and height for your level and your suggestions as well as for the body check (section 4.6). Your profile photo and “About you” are only shown to you in your profile.

Legal basis: Art. 6(1)(b) GDPR; for body weight and height, your consent (section 4.4).

### 4.4 Health data and your consent

Some information may allow conclusions to be drawn about your health. We therefore treat it as health data within the meaning of Art. 9 GDPR:

- **Body measurements:** your body weight, your weight entries and your height (sections 4.3 and 4.5).
- **Body check:** your body check photos and the values derived from them, for example an estimated body fat percentage (section 4.6).

We only process this data with your explicit consent (Art. 9(2)(a) in conjunction with Art. 6(1)(a) GDPR):

- **Body measurements:** When you create your account, you explicitly consent, via the notice directly above the button, to us processing your body data to tailor your training. Before that, weight and height stay on your device.
- **Body check:** Before the app sends your photos for assessment, it informs you that photos and body data will be transferred to OpenAI in the USA for this purpose. By tapping “Done”, you consent to this.

The body check is optional. You can withdraw your consent at any time with effect for the future (section 12).

### 4.5 Workout data and body weight

When you use Loqqa, we store:

- **Plans:** name, workouts per week, blocks with a deload week, workouts in their order (including workouts without a plan), exercises, sets with target values (reps or seconds), reps in reserve (RIR) and rest times
- **Completed workouts:** start and end, which plan and which plan week they count towards, exercises, weight and reps or seconds per set, the time of each completed set and personal records
- **Custom exercises** that you create or that are created during plan import
- **Body weight:** the weight entries you record, one value per day

Why: so that you can log your workouts and your weight and see your history, records, your level and your activity. The app calculates suggestions for your sets and your level on your device.

Legal basis: Art. 6(1)(b) GDPR; for the weight entries, your consent (section 4.4).

### 4.6 Body check

The body check is optional and only available from age 18. For it, you take three photos with the camera: from the front, from the side and from behind. The app recommends wearing underwear or tight-fitting sportswear for this. Your face may be visible in the photos.

The app reduces the photos to a maximum width of 1080 pixels and stores them on your device. When you start the assessment, it uploads the photos to a non-public storage area of your account. They stay there so that you can also see them on your other devices. You need an internet connection for the assessment.

**Assessment by an AI model from OpenAI:** An AI model from OpenAI determines the values of your check. For this, our server transfers to OpenAI:

- the three photos of this check and, if available, the photos of your previous check, so that the model can compare changes directly
- sex, age (calculated from your date of birth), height, weight and training experience from your profile
- the values of your previous check, so that the values remain comparable from check to check

We do not transfer your name, your email address or your account ID. OpenAI processes the data in the USA (section 8). We have configured OpenAI not to store the request for later retrieval. OpenAI does not use data from its API to train its models and retains it for up to 30 days to detect abuse; after that, it is deleted.

The model first checks whether the photos can be assessed, for example whether they are bright enough and your body is visible at least from head to knees. If a photo cannot be assessed, the app asks you to retake it. Otherwise, the model provides values for six muscle groups (shoulders, chest, arms, back, abs, legs), an estimated body fat percentage and values for proportions and definition. From these, our server calculates the overall score. We store these values with your check.

Before our server assesses a check, it checks with RevenueCat whether your account has Loqqa Pro (section 4.11). We log every assessment with its time and result. This way, we limit the number of assessments per day and ensure that stored values come from an assessment. We delete the log together with your account.

The values are rough estimates and not a medical measurement or diagnosis.

**Who has access:** Technically, only the operator of Loqqa, Jan Timo Hünnebeck, can access the storage area. He only looks at body check photos if you ask for this in support, if it is necessary to fix a bug you report, or if we are legally required to do so.

You can delete individual checks in the app. The app then deletes the photos on your device and in our storage. If your device is offline at the time, photos may remain in our storage until you delete your account; in that case, write to us and we will delete them.

Legal basis: your explicit consent (section 4.4), including for the transfer to OpenAI in the USA (Art. 49(1)(a) GDPR, in addition to the safeguards in section 8).

### 4.7 Plan import and plan creation

You can import an existing training plan: as a photo taken with the camera (for example of paper, a whiteboard or a screen), as up to ten images from your photo library or as a file (PDF, Excel, CSV, text or image). Please make sure that no data of other people can be seen in the images and files.

**Recognition by an AI model from OpenAI:** The app reduces photos to a maximum of 2000 pixels on the longest side, saves them as JPEG and transfers them or your file to our server. The server passes them, together with our exercise catalog, to an AI model from OpenAI, which reads out workouts, exercises, sets, reps and rest times. We do not transfer any other data in the process: the request contains neither your account nor your name. OpenAI processes the data in the USA (section 8). We have configured OpenAI not to store the request for later retrieval. OpenAI does not use data from its API to train its models and retains it for up to 30 days to detect abuse.

Our server does not store your photos and files; it only returns the recognized plan to the app. Only the plan you confirm at the end is stored (section 4.5). In the process, the app creates exercises from your plan that our catalog does not know as custom exercises in your account.

**Plan creation by an AI model from OpenAI:** If you have a plan created for you, the app transfers your answers on training goal, focus muscle groups, equipment, workouts per week, workout duration and training experience, as well as your app language, to our server. The server passes them, together with the exercises from our catalog that match your equipment, to an AI model from OpenAI, which puts together your plan from them. We do not transfer your name, your date of birth, sex, weight or height in the process, and the request does not contain your account. The same applies to the processing at OpenAI as for the import. Our server does not store your answers in the process; it only returns the plan to the app, where you can change it.

**Request limits:** To prevent import and plan creation from being misused, we limit how often they can be used per network and in total per day. For this, our server stores for each request the time, whether it was an import or a plan creation, and a hash of your IP address, which it generates with a secret key; we do not store the IP address itself. We delete entries older than two days with every new request.

Legal basis: Art. 6(1)(b) GDPR for the import and plan creation you start, including for the transfer to OpenAI in the USA. For the request limits, Art. 6(1)(f) GDPR; our legitimate interest is to prevent misuse and unnecessary costs.

### 4.8 Support

You can write to us directly in the app via “Report a bug” and “Request a feature”, or you can write to support@itsloqqa.com. In the app, we process:

- the type of your request (bug or idea), for ideas the importance from 1 to 5, your messages and the subject (the first line of your first message)
- up to five screenshots per message that you select from your photo library; the app reduces them (longest side at most 1600 pixels) and saves them as JPEG
- the history of your request, for example status changes, our replies and whether you reopened a request
- your app language, so that we can reply to you in your language

The app first stores screenshots on your device and then uploads them in the background. You cannot delete messages and requests yourself, so that the history remains traceable. They are deleted together with your account; on request, we also delete closed requests earlier. We keep emails for as long as we need them for your request.

Please do not send us health data or data of other people in messages and screenshots if they are not necessary for your request.

Legal basis: Art. 6(1)(b) GDPR, insofar as your request concerns the use of the app, for example in the case of bugs. For ideas and other feedback, Art. 6(1)(f) GDPR; our legitimate interest is to answer your request and improve Loqqa.

### 4.9 Legal texts and agreements

The app loads the currently valid version of the Terms of Use and of this Privacy Policy in your language. When you agree to a version, at registration or later to a changed version, we store which version you agreed to, the time (set by the server), the app version and the platform (iOS or Android). This allows us to prove which version applies to you and to ask you again for your agreement in the event of material changes.

Legal basis: Art. 6(1)(c) in conjunction with Art. 7(1) GDPR (proof of consent) and Art. 6(1)(f) GDPR (our legitimate interest in being able to prove which terms apply).

### 4.10 Loqqa Pro: subscriptions and purchases

You buy Loqqa Pro via Apple’s App Store or via Google Play. Apple or Google, respectively, handle the purchase and payment. They are responsible for this themselves and process your payment data in accordance with their own privacy policies: [Apple](https://www.apple.com/legal/privacy/en-ww/) and [Google](https://policies.google.com/privacy?hl=en). We do not receive payment data such as credit card numbers.

So that we can unlock Loqqa Pro, we learn via RevenueCat (section 4.11) which subscription you bought, whether a trial period is running, when you bought it and whether the subscription is active. The app stores this status on your device and queries it again at startup and every time you sign in. We do not store purchase data in our own database.

You manage and cancel your subscription in the settings of your store account. The app links there under “Manage subscription”.

Legal basis: Art. 6(1)(b) GDPR.

### 4.11 Subscription management with RevenueCat

We manage purchases and subscriptions via RevenueCat. On our behalf, RevenueCat checks the store’s purchase receipts and tells the app whether Loqqa Pro is active. Before our server assesses a body check, it asks RevenueCat whether your account has Loqqa Pro.

So that RevenueCat can assign your purchases to your account, we transfer your account ID, a random identifier without a name or email address. If you buy before creating your account, RevenueCat first assigns its own random identifier and then assigns the purchase to your account. RevenueCat also processes purchase and subscription information from the store (for example product, price, currency, purchase, renewal and expiry dates, trial period and transaction identifiers) as well as technical information such as platform, device type, app version and IP address.

- Provider: RevenueCat, Inc., 1032 E Brandon Blvd #3003, Brandon, FL 33511, USA, as our processor
- Storage location: USA (Amazon Web Services); for the safeguard, see section 8
- Storage period: as long as our contract with RevenueCat exists; we have data relating to your account deleted when you delete your account, unless legal obligations prevent this

Legal basis: Art. 6(1)(b) GDPR.

### 4.12 Technically necessary connection data

Whenever the app is connected to our servers (for example when signing in, syncing, uploading or loading the exercise catalog and legal texts), technically necessary data is processed: your IP address, date and time, the interface accessed and technical information such as status codes and, where transmitted, information about the app and operating system. Our hosting providers log this data to ensure operation and security. At Supabase, the logs are deleted after one day; at PowerSync, as soon as they are no longer needed for operation and security.

Legal basis: Art. 6(1)(f) GDPR; our legitimate interest is stable and secure operation.

### 4.13 Product analytics and error reports with PostHog

To understand how Loqqa is used and to find bugs, we use PostHog. For this, the app sends:

- **Usage events:** which screens you open and certain steps, for example the start of setup, created or imported plans, views of the Loqqa Pro screen, purchases, registration and sign-in, the start, end or cancellation of a workout, each with the time and metrics such as the number of exercises or sets, duration or error code
- **App events:** opening and closing the app, app version, device type, operating system and language
- **Error reports:** crash and error messages with technical details
- **Profile information:** after registration, goal, experience, workouts per week, split, equipment, language, units, an age group (for example “25–34”) and whether you have Loqqa Pro
- **a pseudonymous identifier:** before registration, a random identifier that the app stores on your device, after that your account ID, so that events before and after registration are merged

Your name, your email address, weight, height, your date of birth, body check photos and values, and free text are not sent to PostHog. PostHog does not store your IP address, and we do not use session recordings. When you sign out, the app resets the identifier.

- Provider: PostHog, Inc., 2261 Market St. #4008, San Francisco, CA 94114, USA, as our processor
- Storage location: PostHog Cloud EU (Frankfurt am Main); PostHog is certified under the EU-US Data Privacy Framework (section 8)
- Storage period: events are deleted after one year

Legal basis: Art. 6(1)(f) GDPR; our legitimate interest is to improve Loqqa and fix bugs. You can object to this at any time (section 11), for example by email to support@itsloqqa.com; we will then delete the analytics data relating to your account.

## 5. Storage on your device

So that Loqqa also works offline, the app stores data on your device:

- a local database with your profile, your plans and workouts, your weight entries, your body check values, your support requests and your agreements
- body check photos that you took on this device, and copies of your support screenshots
- your sign-in session, your answers from setup, your subscription status, settings such as the app language, and lists of files that still need to be uploaded
- the exercise catalog
- the identifier and not yet sent events for PostHog (section 4.13)

Except for the data for PostHog, this storage is strictly necessary for the services you want to use (§ 25(2) no. 2 TDDDG).

When you sign out, the app deletes the local database as well as your body check photos and screenshot copies on this device and resets setup, subscription status and ongoing workouts. Changes not yet synced are lost in the process; the app warns you beforehand. Settings such as the app language are kept. When you delete the app, your operating system usually removes all of the app’s data.

Depending on your device settings, the app’s files, including body check photos, may be included in backups of your device (for example with iCloud or Google). Apple or Google, respectively, are responsible for these backups.

## 6. Permissions on your device

Loqqa only asks for a permission when you use a feature that needs it:

- **Camera:** to photograph your training plan, for body check photos and for your profile photo
- **Photos:** to select images for plan import, for support screenshots and for your profile photo. For this, the app uses your operating system’s image picker and only receives the images you select.
- **Files:** to select a plan file via your operating system’s file picker

Loqqa does not ask for access to the microphone, location, contacts or health apps such as Apple Health or Health Connect, and does not send push notifications. You can revoke permissions at any time in your device settings.

## 7. Recipients and processors

We only pass on your data if this is necessary for the purposes stated, you have consented or we are legally required to do so. Our service providers process data on our behalf and in accordance with our instructions (Art. 28 GDPR):

- **Supabase, Inc.** (database, sign-in, file storage, server functions and sending account emails): servers in Frankfurt am Main (Amazon Web Services)
- **PowerSync** by Journey Mobile, Inc. (syncing between the app and the database; for this, the service keeps a copy of your synced data): servers in the EU
- **OpenAI Ireland Ltd.**, 117–126 Sheriff Street Upper, Dublin 1, Ireland (AI creation of plans, recognition of imported plans and assessment of body check photos, sections 4.6 and 4.7): processing in the USA by OpenAI OpCo, LLC
- **RevenueCat, Inc.** (subscription management, section 4.11)
- **PostHog, Inc.** (product analytics and error reports, section 4.13)

Apple and Google receive data as independent controllers for app downloads and purchases (section 4.10), as well as for signing in via their account (section 4.2).

Loqqa is run by one person: only Jan Timo Hünnebeck has access to your data, to the extent he needs it for operation and support.

We only provide data to authorities and courts if we are legally required to do so.

## 8. Transfers to third countries

We store your account, your workouts and your photos in data centers in the EU (Supabase in Frankfurt am Main, PowerSync in the EU). Some of our service providers are based in the USA. Data may therefore also be transferred to the USA, for example during maintenance or support by the service provider. For plan creation, plan import and the assessment of the body check, we transfer data to OpenAI in the USA with every request (sections 4.6 and 4.7), and RevenueCat processes the subscription data in the USA (section 4.11).

We base these transfers on the following safeguards:

- **PostHog:** adequacy decision of the EU Commission for the EU-US Data Privacy Framework, under which PostHog is certified (Art. 45 GDPR)
- **Supabase, PowerSync, OpenAI and RevenueCat:** standard contractual clauses of the EU Commission (Art. 46(2)(c) GDPR), which are part of our data processing agreements
- **Body check:** additionally your explicit consent (Art. 49(1)(a) GDPR). In the USA, authorities may under certain circumstances access data without you having the same legal remedies against this as in the EU.

You can request a copy of the standard contractual clauses from us.

## 9. How long we store your data

- **Account, profile, plans, workouts, weight entries, body checks, support requests and agreements:** as long as your account exists. You can delete individual content yourself beforehand, for example plans, weight entries or body checks. When you delete your account, we delete them completely (section 10). We do not automatically delete accounts that are no longer used; you can request deletion at any time in the app or by email.
- **Answers from setup without an account:** only on your device, until you create an account or delete the app.
- **Data on your device:** until you sign out or delete the app (section 5).
- **Server logs:** one day at Supabase; at PowerSync, as long as they are needed for operation and security (section 4.12).
- **Limits on import and plan creation:** two days (section 4.7).
- **At OpenAI:** up to 30 days (sections 4.6 and 4.7).
- **Analytics data at PostHog:** one year (section 4.13).
- **Subscription data at RevenueCat:** see section 4.11.
- **Backups:** We currently do not create backups of our database and our storage. If this changes, we will add here how long backups are kept.

## 10. Deleting your account

You can delete your account in the app at any time: in the settings under “Delete account”. The following then happens:

1. If you signed in with Apple, you confirm this once more with Apple on an Apple device. This ends the connection between your Apple Account and Loqqa: our server exchanges the confirmation with Apple for your sign-in keys and has them revoked immediately. Nothing is stored in the process.
2. The app deletes your profile photo, your body check photos and your support screenshots from our storage.
3. Your account is then deleted. This automatically deletes all associated data in our database: profile, plans, workouts, weight entries, body checks, support requests with all messages and your stored agreements. The copy at PowerSync is also removed in the process.
4. Finally, the app signs you out on this device and deletes the data stored there.

**This does not end an active subscription.** Cancel it in the App Store or on Google Play.

On other devices on which you were signed in, locally stored data may remain until you sign out there or delete the app. Analytics data at PostHog and subscription data at RevenueCat are not automatically deleted as well; write to us if you want us to have them deleted immediately, otherwise the periods from section 9 apply.

If deletion does not work, for example without an internet connection, the app shows a notice and you can try again. You can also request deletion by email to support@itsloqqa.com.

## 11. Your rights

You have the following rights with respect to us:

- **Access** to the data we process about you (Art. 15 GDPR)
- **Rectification** of incorrect data (Art. 16 GDPR); you can change much of the information directly in the app, we change everything else when you message us
- **Erasure** of your data (Art. 17 GDPR); you can delete your account directly in the app (section 10)
- **Restriction** of processing (Art. 18 GDPR)
- **Data portability** (Art. 20 GDPR): on your request by email, we will send you the data you provided to us as a JSON file within one month.
- **Withdrawal** of consent given (section 12)

**Right to object (Art. 21 GDPR):** If we process data on the basis of Art. 6(1)(f) GDPR (legitimate interests), for example for product analytics with PostHog, you can object to this processing at any time on grounds relating to your particular situation. We will then no longer process the data, unless we can demonstrate compelling legitimate grounds that override your interests, or the processing serves the establishment, exercise or defense of legal claims.

For all requests, an email to support@itsloqqa.com is enough. So that we can identify your account, please write to us from your account’s email address.

## 12. Withdrawing consent

You can withdraw consent at any time with effect for the future (Art. 7(3) GDPR). Processing carried out before the withdrawal remains lawful.

- **Body measurements:** by email to support@itsloqqa.com. We will then delete your weight, your height and your weight entries. Without this information, the app can only tailor your training to a limited extent; alternatively, you can also delete your account (section 10).
- **Body check:** Delete your checks in the app and do not do any new ones, or write to us; we will then delete all body check photos and values.

## 13. Complaint to a supervisory authority

You can lodge a complaint with a data protection supervisory authority (Art. 77 GDPR), in particular in the EU member state in which you live or work or in which the alleged infringement took place. The authority responsible for us is the Bayerisches Landesamt für Datenschutzaufsicht (Bavarian Data Protection Authority), Promenade 18, 91522 Ansbach, Germany, [www.lda.bayern.de](https://www.lda.bayern.de).

## 14. Do you have to give us data?

For an account, we need your email address and a password or your Google account or Apple Account. Without an account, you cannot use Loqqa after setup. The app needs the information from setup to check your age and to create and adapt your plan. In particular, your sex (you can choose “Prefer not to say”), the body check, weight entries, a profile photo and the “About you” text are optional.

## 15. No automated decisions

The app creates plans, suggestions, levels and body check values automatically; plans you have created for you and the body check values are determined by an AI model from OpenAI (sections 4.6 and 4.7). These are recommendations and estimates for your training. We do not make decisions that produce legal effects concerning you or similarly significantly affect you (Art. 22 GDPR).

## 16. Children and teenagers

Loqqa is aimed at people who have reached the age at which they may consent to the processing of their data themselves in their country: in Germany from age 16, in other countries from age 13 to 16 depending on local law. During setup, the app asks for your date of birth and only lets you continue from this age; the country set on your device is decisive. The body check is only available from age 18.

If we learn that an account belongs to a person under the minimum age, we will delete it.

## 17. Security

We protect your data with technical and organizational measures, including:

- encrypted transmission between the app and servers (HTTPS/TLS)
- access rules in the database through which each account can only read and change its own data
- non-public storage areas for profile photos, body check photos and screenshots, in which each account can only access its own folder
- time-limited links for displaying photos: one hour for body check photos and screenshots, 24 hours for profile photos
- passwords that are only stored as a hash

No system is completely secure. As the app stores data on your device, please protect your device with a screen lock.

## 18. Changes to this Privacy Policy

We adapt this Privacy Policy when the app or the legal situation changes. You can find the currently valid version in the app in the settings and at [itsloqqa.com](https://itsloqqa.com). We will inform you about material changes in the app and, where necessary, ask for your consent.
