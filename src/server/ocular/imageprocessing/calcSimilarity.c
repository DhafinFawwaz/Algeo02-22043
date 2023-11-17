#include <math.h>
#include <stdio.h>
#include <stdlib.h>

double cosineSimilarity(double *A, double *B, int vectorSize)
{
    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;
    int i = 0;
    for (i = 0; i < vectorSize; i++)
    {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    return dotProduct / (sqrt(normA) * sqrt(normB));
}

double cosineSimilarityColor(int *A, int *B, int vectorSize)
{
    double *c;
    c = (double *)malloc(sizeof(double) * 16);

    double dotProduct;
    double normA;
    double normB;
    double total = 0;

    int j = 0;
    int i = 0;
    int k;
    printf("\n%d %d\n", A[0], B[0]);
    for (j = 0; j < 16; j++)
    {
        dotProduct = 0.0;
        normA = 0.0;
        normB = 0.0;
        for (i = 0; i < vectorSize; i++)
        {
            k = j * 72;
            dotProduct += (double)A[k + i] * (double)B[k + i];
            normA += (double)A[k + i] * (double)A[k + i];
            normB += (double)B[k + i] * (double)B[k + i];
        }
        c[j] = (dotProduct / (sqrt(normA) * sqrt(normB)));
        if (c[j] < 0)
        {
            c[j] = -c[j];
        }
        printf("%lf ", c[j]);
    }
    printf("\n===================================\n");

    for (i = 0; i < 16; i++)
    {
        total += c[i];
    }

    return ((double)total / 16.0);
}