-- CreateTable
CREATE TABLE "Labels" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emails" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "cc" TEXT,
    "bcc" TEXT,
    "recievedAt" TIMESTAMP(3) NOT NULL,
    "body" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmailsToLabels" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Emails_messageId_key" ON "Emails"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_EmailsToLabels_AB_unique" ON "_EmailsToLabels"("A", "B");

-- CreateIndex
CREATE INDEX "_EmailsToLabels_B_index" ON "_EmailsToLabels"("B");

-- AddForeignKey
ALTER TABLE "Emails" ADD CONSTRAINT "Emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailsToLabels" ADD CONSTRAINT "_EmailsToLabels_A_fkey" FOREIGN KEY ("A") REFERENCES "Emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmailsToLabels" ADD CONSTRAINT "_EmailsToLabels_B_fkey" FOREIGN KEY ("B") REFERENCES "Labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
